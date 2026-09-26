"use client";

import { useEffect, useRef, useState } from "react";
import {
  GAME_CONFIG,
  GAME_DURATION_SECONDS,
  MAX_ATTEMPTS,
  OBSTACLE_COLLISION_CONFIG,
} from "@/game/config";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

export type GameCompletePayload = {
  score: number;
  distance: number;
  xp: number;
};

type GamePhase = "ready" | "playing" | "retry" | "complete";
type AnchorKind = "anchor" | "bounce";

type Anchor = {
  x: number;
  y: number;
  radius: number;
  kind: AnchorKind;
  phase: number;
  platformWidth?: number;
  isStarting?: boolean;
};

type Hazard = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "shard" | "drone";
};

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  anchorIndex: number;
  angle: number;
  ropeLength: number;
  angularVelocity: number;
  releaseGrace: number;
  startingBounceGrace: number;
};

type World = {
  width: number;
  height: number;
  player: Player;
  anchors: Anchor[];
  hazards: Hazard[];
  cameraX: number;
  lastGeneratedX: number;
  routeX: number;
  routeY: number;
  elapsed: number;
  distance: number;
  running: boolean;
  attempt: number;
  lastFrame: number;
  nextHudUpdate: number;
};

export interface MiniGameProps {
  gameDurationSeconds?: number;
  onGameComplete?: (payload: GameCompletePayload) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function createWorld(width: number, height: number, attempt: number): World {
  const startY = height * 0.58;
  const anchors: Anchor[] = [
    {
      x: GAME_CONFIG.player.START_X,
      y: startY + GAME_CONFIG.platform.START_OFFSET_Y,
      radius: GAME_CONFIG.grapple.RADIUS,
      kind: "bounce",
      phase: 0,
      platformWidth: GAME_CONFIG.platform.START_WIDTH,
      isStarting: true,
    },
    { x: 430, y: height * 0.28, radius: GAME_CONFIG.grapple.RADIUS, kind: "anchor", phase: 0.3 },
    { x: 610, y: height * 0.64, radius: GAME_CONFIG.grapple.RADIUS, kind: "anchor", phase: 1.8 },
    { x: 905, y: height * 0.3, radius: GAME_CONFIG.grapple.RADIUS, kind: "anchor", phase: 2.9 },
    { x: 1200, y: height * 0.57, radius: GAME_CONFIG.grapple.RADIUS, kind: "bounce", phase: 4.2 },
    { x: 1500, y: height * 0.25, radius: GAME_CONFIG.grapple.RADIUS, kind: "anchor", phase: 5.1 },
  ];
  const hazards: Hazard[] = [
    { x: 1040, y: height * 0.25, width: 38, height: 22, type: "drone" },
    { x: 1330, y: height * 0.72, width: 30, height: 90, type: "shard" },
  ];

  return {
    width,
    height,
    player: {
      x: GAME_CONFIG.player.START_X,
      y: startY,
      vx: 0,
      vy: 0,
      radius: GAME_CONFIG.player.RADIUS,
      anchorIndex: -1,
      angle: 0.92,
      ropeLength: 162,
      angularVelocity: 0,
      releaseGrace: 0,
      startingBounceGrace: 0,
    },
    anchors,
    hazards,
    cameraX: 0,
    lastGeneratedX: 1500,
    routeX: anchors[anchors.length - 1].x,
    routeY: anchors[anchors.length - 1].y,
    elapsed: 0,
    distance: 0,
    running: false,
    attempt,
    lastFrame: 0,
    nextHudUpdate: 0,
  };
}

export function MiniGame({
  gameDurationSeconds = GAME_DURATION_SECONDS,
  onGameComplete,
}: MiniGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const distanceRef = useRef<HTMLSpanElement>(null);
  const attemptRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<GamePhase>("ready");
  const isInViewRef = useRef(false);
  const spaceLockUntilRef = useRef<number>(0);
  const worldRef = useRef<World | null>(null);
  const inputHeldRef = useRef(false);
  const bestDistanceRef = useRef(0);
  const completionSentRef = useRef(false);
  const startAttemptRef = useRef<(attempt: number) => void>(() => undefined);
  const completeRef = useRef(onGameComplete);
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [attempt, setAttempt] = useState(1);
  const [result, setResult] = useState({ distance: 0, xp: 0 });

  completeRef.current = onGameComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let dpr = 1;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const current = worldRef.current;
      if (current) {
        current.width = rect.width;
        current.height = rect.height;
      } else {
        worldRef.current = createWorld(rect.width, rect.height, 1);
      }
    };

    const setGamePhase = (next: GamePhase) => {
      phaseRef.current = next;
      setPhase(next);
    };

    const updateHud = (world: World) => {
      if (timeRef.current) {
        timeRef.current.textContent = `${Math.max(0, gameDurationSeconds - world.elapsed).toFixed(1)}s`;
      }
      if (distanceRef.current) {
        distanceRef.current.textContent = `${Math.floor(world.distance).toLocaleString()}m`;
      }
      if (attemptRef.current) {
        attemptRef.current.textContent = `${world.attempt} / ${MAX_ATTEMPTS}`;
      }
    };

    const generateAhead = (world: World) => {
      const getBouncePhysics = (horizontalDistance: number) => {
        const gravity = GAME_CONFIG.player.GRAVITY;
        const launchSpeed = Math.max(
          Math.abs(GAME_CONFIG.player.BOUNCE_VERTICAL_SPEED),
          Math.max(0, -world.player.vy)
        );
        const timeToApex = launchSpeed / gravity;
        const maxAirTime = timeToApex * 2;
        const horizontalSpeed = Math.max(
          GAME_CONFIG.player.BOUNCE_HORIZONTAL_SPEED,
          Math.abs(world.player.vx),
          1
        );

        return {
          gravity,
          launchSpeed,
          maxAirTime,
          horizontalSpeed,
          travelTime: horizontalDistance / horizontalSpeed,
          theoreticalMaxRise: launchSpeed ** 2 / (2 * gravity),
        };
      };

      const verticalPositionAt = (
        sourcePlayerY: number,
        physics: ReturnType<typeof getBouncePhysics>,
        time: number
      ) =>
        sourcePlayerY -
        physics.launchSpeed * time +
        0.5 * physics.gravity * time ** 2;

      const createReachablePlatform = (
        world: World,
        baseGap: number,
        index: number
      ) => {
        const sourcePlayerY =
          world.routeY - GAME_CONFIG.platform.LANDING_CENTER_OFFSET;
        const safeDistance =
          world.player.radius + GAME_CONFIG.platform.COLLISION_MARGIN;

        for (
          let retry = 0;
          retry < GAME_CONFIG.platform.MAX_GENERATION_RETRIES;
          retry += 1
        ) {
          const candidateGap = Math.max(
            GAME_CONFIG.grapple.MIN_SPACING,
            baseGap - retry * 18
          );
          const physics = getBouncePhysics(candidateGap);
          const horizontalReach =
            physics.horizontalSpeed * physics.maxAirTime - safeDistance;
          const candidateX = world.routeX + candidateGap;

          if (candidateGap > horizontalReach) continue;

          const centerTime = physics.travelTime;
          const platformTimeWindow =
            (GAME_CONFIG.platform.WIDTH / 2 + world.player.radius) /
            physics.horizontalSpeed;
          const startTime = clamp(
            centerTime - platformTimeWindow,
            0,
            physics.maxAirTime
          );
          const endTime = clamp(
            centerTime + platformTimeWindow,
            0,
            physics.maxAirTime
          );
          const arcStart = verticalPositionAt(
            sourcePlayerY,
            physics,
            startTime
          );
          const arcEnd = verticalPositionAt(sourcePlayerY, physics, endTime);
          const arcMin = Math.min(arcStart, arcEnd);
          const arcMax = Math.max(arcStart, arcEnd);
          const verticalSafetyTop =
            sourcePlayerY +
            physics.theoreticalMaxRise * -1 +
            GAME_CONFIG.platform.REACHABILITY_MARGIN;
          const arcVariation =
            Math.sin(index * 1.7 + world.attempt + retry) *
            Math.min(28, Math.max(8, (arcMax - arcMin) * 0.3));
          const candidatePlayerY =
            verticalPositionAt(sourcePlayerY, physics, centerTime) +
            arcVariation;
          const candidateY =
            candidatePlayerY + GAME_CONFIG.platform.LANDING_CENTER_OFFSET;

          const verticalReachable =
            candidatePlayerY >= verticalSafetyTop &&
            candidatePlayerY >= arcMin - GAME_CONFIG.platform.REACHABILITY_MARGIN &&
            candidatePlayerY <= arcMax + GAME_CONFIG.platform.REACHABILITY_MARGIN;
          const collisionReachable =
            candidateY >= GAME_CONFIG.grapple.MIN_HEIGHT &&
            candidateY <=
              world.height - GAME_CONFIG.grapple.MAX_HEIGHT_PADDING;
          const safeDifficulty =
            candidateGap <= horizontalReach &&
            centerTime <= physics.maxAirTime;

          if (verticalReachable && collisionReachable && safeDifficulty) {
            return { x: candidateX, y: candidateY };
          }
        }

        const fallbackPhysics = getBouncePhysics(
          GAME_CONFIG.grapple.MIN_SPACING
        );
        const fallbackGap = Math.min(
          baseGap,
          fallbackPhysics.horizontalSpeed * fallbackPhysics.maxAirTime -
            safeDistance
        );
        const fallbackTime =
          fallbackGap / fallbackPhysics.horizontalSpeed;
        const fallbackPlayerY = verticalPositionAt(
          sourcePlayerY,
          fallbackPhysics,
          fallbackTime
        );

        return {
          x: world.routeX + fallbackGap,
          y: clamp(
            fallbackPlayerY + GAME_CONFIG.platform.LANDING_CENTER_OFFSET,
            GAME_CONFIG.grapple.MIN_HEIGHT,
            world.height - GAME_CONFIG.grapple.MAX_HEIGHT_PADDING
          ),
        };
      };

      while (
        world.lastGeneratedX <
        world.player.x + GAME_CONFIG.grapple.MAX_VISIBLE_AHEAD
      ) {
        const index = world.anchors.length;
        const kind: AnchorKind =
          index % 6 === 4 && GAME_CONFIG.grapple.DENSITY > 0.5
            ? "bounce"
            : "anchor";
        const gap =
          GAME_CONFIG.grapple.MIN_SPACING +
          ((index * 83 + world.attempt * 41) %
            (GAME_CONFIG.grapple.MAX_SPACING -
              GAME_CONFIG.grapple.MIN_SPACING));
        const heightWave = Math.sin(index * 1.7 + world.attempt) * 0.2;
        const genericY =
          world.height * (0.26 + ((index * 37) % 42) / 100 + heightWave * 0.2);
        const platformCandidate =
          kind === "bounce"
            ? createReachablePlatform(world, gap, index)
            : undefined;
        const x = platformCandidate?.x ?? world.routeX + gap;
        const y =
          platformCandidate?.y ??
          clamp(
            genericY,
            GAME_CONFIG.grapple.MIN_HEIGHT,
            world.height - GAME_CONFIG.grapple.MAX_HEIGHT_PADDING
          );
        world.anchors.push({
          x,
          y,
          radius: GAME_CONFIG.grapple.RADIUS,
          kind,
          phase: index * 0.76,
          platformWidth:
            kind === "bounce" ? GAME_CONFIG.platform.WIDTH : undefined,
        });
        world.routeX = x;
        world.routeY = y;
        if (index % 5 === 2) {
          world.hazards.push({
            x: x - GAME_CONFIG.obstacles.LOOKAHEAD_OFFSET,
            y: index % 2 ? world.height * 0.2 : world.height * 0.75,
            width: index % 2
              ? GAME_CONFIG.obstacles.DRONE_WIDTH
              : GAME_CONFIG.obstacles.SHARD_WIDTH,
            height: index % 2
              ? GAME_CONFIG.obstacles.DRONE_HEIGHT
              : GAME_CONFIG.obstacles.SHARD_HEIGHT,
            type: index % 2 ? "drone" : "shard",
          });
        }
        world.lastGeneratedX = x;
      }
    };

    const findAnchor = (world: World) => {
      let nearest = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;
      world.anchors.forEach((anchor, index) => {
        if (anchor.isStarting) return;
        const dx = anchor.x - world.player.x;
        const dy = anchor.y - world.player.y;
        const distance = Math.hypot(dx, dy);
        if (
          dx > -GAME_CONFIG.grapple.LOOK_BEHIND &&
          dx < GAME_CONFIG.grapple.RANGE &&
          distance < nearestDistance
        ) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      return nearest;
    };

    const attach = (world: World) => {
      if (world.player.anchorIndex >= 0) return;
      const index = findAnchor(world);
      if (index < 0) return;
      const anchor = world.anchors[index];
      const dx = world.player.x - anchor.x;
      const dy = world.player.y - anchor.y;
      world.player.anchorIndex = index;
      world.player.ropeLength = clamp(
        Math.hypot(dx, dy),
        GAME_CONFIG.swing.MIN_ROPE_LENGTH,
        GAME_CONFIG.swing.MAX_ROPE_LENGTH
      );
      world.player.angle = Math.atan2(dx, dy);
      world.player.angularVelocity = clamp(
        world.player.vx / world.player.ropeLength,
        -GAME_CONFIG.swing.MAX_ANGULAR_VELOCITY,
        GAME_CONFIG.swing.MAX_ANGULAR_VELOCITY
      );
    };

    const release = (world: World) => {
      if (world.player.anchorIndex < 0) return;
      const angle = world.player.angle;
      const speed = world.player.angularVelocity * world.player.ropeLength;
      world.player.vx =
        Math.cos(angle) * speed + GAME_CONFIG.swing.RELEASE_FORWARD_SPEED;
      world.player.vy = -Math.sin(angle) * speed;
      world.player.anchorIndex = -1;
      world.player.releaseGrace = GAME_CONFIG.swing.RELEASE_GRACE_SECONDS;
    };

    const endAttempt = (world: World) => {
      if (!world.running) return;
      world.running = false;
      inputHeldRef.current = false;
      bestDistanceRef.current = Math.max(bestDistanceRef.current, world.distance);
      const bestDistance = Math.floor(bestDistanceRef.current);
      const xp = clamp(
        Math.round(bestDistance * GAME_CONFIG.XP_PER_DISTANCE),
        GAME_CONFIG.MIN_XP,
        GAME_CONFIG.MAX_XP
      );
      setResult({ distance: bestDistance, xp });

      if (world.attempt === 1) {
        // Lock Spacebar input for 2 seconds to prevent instinctive press from scrolling the page
        spaceLockUntilRef.current = Date.now() + 2000;
        setGamePhase("retry");
      } else {
        setGamePhase("complete");
        if (!completionSentRef.current) {
          completionSentRef.current = true;
          completeRef.current?.({
            score: bestDistance,
            distance: bestDistance,
            xp,
          });

          // Auto-scroll to result section after completion delay
          const delay = ANIMATION_CONFIG.game.completionTransitionDelay ?? 2000;
          setTimeout(() => {
            const resultSection = document.getElementById("result");
            if (resultSection) {
              resultSection.scrollIntoView({ behavior: "smooth" });
            }
          }, delay);
        }
      }
    };

    const startAttempt = (nextAttempt: number) => {
      if (nextAttempt > MAX_ATTEMPTS || phaseRef.current === "playing") return;
      spaceLockUntilRef.current = 0;
      const rect = stage.getBoundingClientRect();
      const world = createWorld(rect.width, rect.height, nextAttempt);
      world.running = true;
      worldRef.current = world;
      setAttempt(nextAttempt);
      setGamePhase("playing");
      updateHud(world);
    };

    startAttemptRef.current = startAttempt;

    const hitHazard = (world: World, px?: number, py?: number) => {
      const cx = px ?? world.player.x;
      const cy = py ?? world.player.y;
      const r = world.player.radius; // exact radius — two-point capsule provides full coverage without inflation
      // Pill/capsule: head at cy-9 (drawn head arc centre), body at cy+4 (body rect centre)
      // Capsule bottom reach: cy+4+13 = cy+17 ≈ visual body bottom at cy+16 → 1px contact margin only
      return world.hazards.some((hazard) => {
        const typeConfig = OBSTACLE_COLLISION_CONFIG[hazard.type] ?? {
          scale: 1,
          paddingX: 0,
          paddingY: 0,
        };
        const effectiveScale = OBSTACLE_COLLISION_CONFIG.globalScale * typeConfig.scale;
        const effectiveWidth = Math.max(1, hazard.width * effectiveScale - typeConfig.paddingX);
        const effectiveHeight = Math.max(1, hazard.height * effectiveScale - typeConfig.paddingY);

        // Keep collision box centered inside the visual obstacle
        const hitboxX = hazard.x + (hazard.width - effectiveWidth) / 2;
        const hitboxY = hazard.y + (hazard.height - effectiveHeight) / 2;

        for (const testY of [cy - 9, cy + 4]) {
          const closestX = clamp(cx, hitboxX, hitboxX + effectiveWidth);
          const closestY = clamp(testY, hitboxY, hitboxY + effectiveHeight);
          if (Math.hypot(cx - closestX, testY - closestY) < r) return true;
        }
        return false;
      });
    };

    const update = (world: World, dt: number) => {
      if (!world.running) return;
      world.elapsed += dt;
      const player = world.player;
      // Snapshot position before physics integration — used by swept collision below
      const prevX = player.x;
      const prevY = player.y;
      player.releaseGrace = Math.max(0, player.releaseGrace - dt);
      player.startingBounceGrace = Math.max(
        0,
        player.startingBounceGrace - dt
      );

      generateAhead(world);
      if (player.anchorIndex >= 0) {
        const anchor = world.anchors[player.anchorIndex];
        const gravity = GAME_CONFIG.swing.GRAVITY;
        player.angularVelocity += (-gravity / (player.ropeLength / 100)) * Math.sin(player.angle) * dt;
        player.angularVelocity *= Math.pow(
          GAME_CONFIG.swing.DAMPING,
          dt * 60
        );
        player.angle += player.angularVelocity * dt;
        player.x = anchor.x + Math.sin(player.angle) * player.ropeLength;
        player.y = anchor.y + Math.cos(player.angle) * player.ropeLength;
        player.vx = Math.cos(player.angle) * player.ropeLength * player.angularVelocity;
        player.vy = -Math.sin(player.angle) * player.ropeLength * player.angularVelocity;
      } else {
        player.vy += GAME_CONFIG.player.GRAVITY * dt;
        player.vx += GAME_CONFIG.player.AIR_ACCELERATION * dt;
        player.vx *= Math.pow(GAME_CONFIG.player.AIR_DRAG, dt * 60);
        player.x += player.vx * dt;
        player.y += player.vy * dt;
      }

      const activeAnchor = world.anchors.find(
        (anchor) =>
          anchor.kind === "bounce" &&
          Math.abs(player.x - anchor.x) <
            (anchor.platformWidth ?? GAME_CONFIG.platform.WIDTH) / 2 &&
          Math.abs(player.y - anchor.y) < 42 &&
          player.vy > 0
      );
      if (activeAnchor) {
        const isStartingPlatform = activeAnchor.isStarting === true;
        player.vy = GAME_CONFIG.player.BOUNCE_VERTICAL_SPEED;
        player.vx = isStartingPlatform
          ? 0
          : Math.max(
              player.vx,
              GAME_CONFIG.player.BOUNCE_HORIZONTAL_SPEED
            );
        player.startingBounceGrace = isStartingPlatform
          ? GAME_CONFIG.platform.STARTING_BOUNCE_GRACE_SECONDS
          : 0;
        player.y =
          activeAnchor.y - GAME_CONFIG.platform.LANDING_CENTER_OFFSET;
      }

      if (
        inputHeldRef.current &&
        player.startingBounceGrace <= 0
      ) {
        attach(world);
      }
      world.distance = Math.max(0, player.x - 120);
      const cameraTarget = Math.max(
        0,
        player.x - GAME_CONFIG.camera.PLAYER_LEAD
      );
      world.cameraX +=
        (cameraTarget - world.cameraX) *
        Math.min(1, dt * GAME_CONFIG.camera.FOLLOW_SPEED);
      world.cameraX = Math.max(0, world.cameraX);

      // Swept collision: sample 4 positions along this frame's movement path.
      // Catches fast-moving players (free-flight or grapple arc) skipping through
      // a narrow obstacle (28px shard) in a single frame. Also handles rapid
      // grapple/release spam — releaseGrace is now 60ms so each chain window is tiny.
      if (player.releaseGrace <= 0) {
        const SUBSTEPS = 4;
        for (let step = 1; step <= SUBSTEPS; step++) {
          const t = step / SUBSTEPS;
          const sx = prevX + (player.x - prevX) * t;
          const sy = prevY + (player.y - prevY) * t;
          if (hitHazard(world, sx, sy)) {
            endAttempt(world);
            return;
          }
        }
      }

      if (
        world.elapsed >= gameDurationSeconds ||
        player.y > world.height + 180 ||
        player.x < world.cameraX - 160
      ) {
        endAttempt(world);
      }
    };

    const roundRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    };

    const draw = (world: World, now: number) => {
      const rect = stage.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      context.clearRect(0, 0, width, height);

      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#111d43");
      sky.addColorStop(0.55, "#182b56");
      sky.addColorStop(1, "#0b1837");
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      const horizon = height * 0.72;
      context.fillStyle = "rgba(238, 150, 99, 0.08)";
      context.beginPath();
      context.arc(width * 0.78, height * 0.22, Math.min(width, height) * 0.15, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255, 213, 162, 0.7)";
      context.beginPath();
      context.arc(width * 0.78, height * 0.22, 2.2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(190, 212, 236, 0.65)";
      for (let i = 0; i < 46; i += 1) {
        const starX = ((i * 193 + 37) % Math.max(1, width * 1.4)) - world.cameraX * 0.08;
        const starY = 34 + ((i * 71) % Math.max(1, height * 0.58));
        const twinkle = 0.45 + Math.sin(now / 900 + i) * 0.25;
        context.globalAlpha = twinkle;
        context.fillRect(starX, starY, i % 8 === 0 ? 2 : 1, i % 8 === 0 ? 2 : 1);
      }
      context.globalAlpha = 1;

      context.fillStyle = "rgba(6, 14, 35, 0.7)";
      context.beginPath();
      context.moveTo(0, horizon);
      for (let x = 0; x <= width + 40; x += 40) {
        const skyline = horizon - 35 - ((x * 13) % 65);
        context.lineTo(x, skyline);
        context.lineTo(x + 26, skyline);
      }
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fill();

      context.strokeStyle = "rgba(78, 143, 159, 0.12)";
      context.lineWidth = 1;
      for (let y = horizon + 10; y < height; y += 26) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y + (y - horizon) * 0.08);
        context.stroke();
      }
      for (let x = -world.cameraX % 90; x < width; x += 90) {
        context.beginPath();
        context.moveTo(x, horizon);
        context.lineTo(x - (x - width / 2) * 0.42, height);
        context.stroke();
      }

      world.hazards.forEach((hazard) => {
        const x = hazard.x - world.cameraX;
        if (x < -100 || x > width + 100) return;
        context.save();
        context.translate(x + hazard.width / 2, hazard.y + hazard.height / 2);
        context.shadowColor = "rgba(250, 120, 77, 0.5)";
        context.shadowBlur = 16;
        context.fillStyle = hazard.type === "drone" ? "#e76e4b" : "#c85248";
        if (hazard.type === "drone") {
          roundRect(context, -hazard.width / 2, -hazard.height / 2, hazard.width, hazard.height, 6);
          context.fill();
          context.shadowBlur = 0;
          context.fillStyle = "#ffc17b";
          context.fillRect(-9, -2, 18, 4);
        } else {
          context.beginPath();
          context.moveTo(0, -hazard.height / 2);
          context.lineTo(hazard.width / 2, hazard.height / 2);
          context.lineTo(-hazard.width / 2, hazard.height / 2);
          context.closePath();
          context.fill();
        }
        context.restore();
      });

      world.anchors.forEach((anchor, index) => {
        const x = anchor.x - world.cameraX;
        if (x < -100 || x > width + 100) return;
        const isAttached = index === world.player.anchorIndex;
        const pulse = 1 + Math.sin(now / 500 + anchor.phase) * 0.09;
        context.save();
        context.translate(x, anchor.y);
        context.globalAlpha = anchor.kind === "bounce" ? 0.86 : 1;
        context.strokeStyle = anchor.kind === "bounce" ? "#55b5b5" : "#f27b4e";
        context.lineWidth = isAttached ? 3 : 2;
        context.shadowColor = anchor.kind === "bounce" ? "rgba(85, 181, 181, 0.5)" : "rgba(242, 123, 78, 0.5)";
        context.shadowBlur = isAttached ? 18 : 10;
        context.beginPath();
        context.arc(0, 0, anchor.radius * pulse, 0, Math.PI * 2);
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = anchor.kind === "bounce" ? "rgba(85, 181, 181, 0.18)" : "rgba(242, 123, 78, 0.18)";
        context.fill();
        context.fillStyle = anchor.kind === "bounce" ? "#8ed5c9" : "#ffc077";
        context.beginPath();
        context.arc(0, 0, 3.5, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      world.anchors.forEach((anchor) => {
        if (anchor.kind !== "bounce") return;
        const x = anchor.x - world.cameraX;
        if (x < -100 || x > width + 100) return;
        context.save();
        context.translate(x, anchor.y - 22);
        const platformWidth =
          anchor.platformWidth ?? GAME_CONFIG.platform.WIDTH;
        context.shadowColor = "rgba(85, 181, 181, 0.45)";
        context.shadowBlur = 14;
        context.fillStyle = "rgba(85, 181, 181, 0.24)";
        roundRect(context, -platformWidth / 2, -5, platformWidth, 10, 5);
        context.fill();
        context.shadowBlur = 0;
        context.strokeStyle = "#8ed5c9";
        context.lineWidth = 1.5;
        roundRect(context, -platformWidth / 2, -5, platformWidth, 10, 5);
        context.stroke();
        context.restore();
      });

      const player = world.player;
      if (player.anchorIndex >= 0) {
        const anchor = world.anchors[player.anchorIndex];
        context.strokeStyle = "rgba(255, 196, 125, 0.85)";
        context.lineWidth = 1.5;
        context.setLineDash([6, 6]);
        context.beginPath();
        context.moveTo(anchor.x - world.cameraX, anchor.y);
        context.lineTo(player.x - world.cameraX, player.y);
        context.stroke();
        context.setLineDash([]);
      }

      context.save();
      context.translate(player.x - world.cameraX, player.y);
      const direction = player.vx >= 0 ? 1 : -1;
      context.scale(direction, 1);
      context.rotate(clamp(Math.atan2(player.vy, player.vx) * 0.15, -0.3, 0.3));
      context.shadowColor = "#f27b4e";
      context.shadowBlur = 22;
      context.fillStyle = "#fa784d";
      context.beginPath();
      context.arc(0, -9, 7, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = "#ffcd91";
      context.beginPath();
      context.arc(2, -10, 2.4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#f27b4e";
      roundRect(context, -5, -2, 10, 18, 4);
      context.fill();
      context.strokeStyle = "#ffdba6";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(-4, 2);
      context.lineTo(-13, 9);
      context.moveTo(4, 2);
      context.lineTo(12, 8);
      context.moveTo(-2, 15);
      context.lineTo(-8, 25);
      context.moveTo(2, 15);
      context.lineTo(8, 24);
      context.stroke();
      context.restore();
    };

    const handlePress = (event?: Event) => {
      event?.preventDefault();
      if (phaseRef.current === "ready") {
        startAttemptRef.current(1);
        inputHeldRef.current = true;
        return;
      }
      if (phaseRef.current === "playing") {
        inputHeldRef.current = true;
      }
    };

    const handleRelease = (event?: Event) => {
      event?.preventDefault();
      inputHeldRef.current = false;
      const world = worldRef.current;
      if (world && phaseRef.current === "playing") release(world);
    };

    const isSpaceKey = (e: KeyboardEvent) =>
      e.code === "Space" || e.key === " " || e.keyCode === 32;

    const isGameActive = () =>
      isInViewRef.current &&
      (phaseRef.current === "ready" || phaseRef.current === "playing");

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSpaceKey(event)) return;

      // 2-second Spacebar lock immediately after Attempt 1 ends (consume Space & prevent scroll)
      if (isInViewRef.current && Date.now() < spaceLockUntilRef.current) {
        event.preventDefault();
        return;
      }

      if (!isGameActive()) return;

      // Always prevent browser default scroll on press and hold ticks during active gameplay
      event.preventDefault();

      if (!event.repeat) {
        handlePress(event);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!isSpaceKey(event)) return;

      // 2-second Spacebar lock immediately after Attempt 1 ends
      if (isInViewRef.current && Date.now() < spaceLockUntilRef.current) {
        event.preventDefault();
        return;
      }

      if (!isGameActive()) return;

      event.preventDefault();
      handleRelease(event);
    };


    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.2 }
    );
    visibilityObserver.observe(stage);

    canvas.addEventListener("pointerdown", handlePress);
    window.addEventListener("pointerup", handleRelease);
    window.addEventListener("pointercancel", handleRelease);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const frame = (now: number) => {
      const world = worldRef.current;
      if (world) {
        if (!world.lastFrame) world.lastFrame = now;
        const dt = Math.min(0.033, (now - world.lastFrame) / 1000);
        world.lastFrame = now;
        update(world, dt);
        draw(world, now);
        if (now > world.nextHudUpdate) {
          updateHud(world);
          world.nextHudUpdate = now + 100;
        }
      }
      if (phaseRef.current !== "complete") {
        animationFrame = window.requestAnimationFrame(frame);
      }
    };
    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePress);
      window.removeEventListener("pointerup", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };

  }, [gameDurationSeconds]);

  const isResult = phase === "retry" || phase === "complete";

  return (
    <section
      id="game"
      className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12"
      aria-label="Playable Challenge: Endless Grapple"
    >
      <div
        className="game-shell relative flex flex-col w-full h-[620px] sm:h-[680px] max-h-[85vh] rounded-2xl overflow-hidden border border-[rgba(145,168,205,0.25)] shadow-2xl"
        data-testid="game-shell"
      >
        <div className="scan-line" aria-hidden="true" />
        
        {/* Game Top Bar */}
        <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-[#0a1228]/80 backdrop-blur-md border-b border-[#91a8cd]/15">
          <div className="flex items-center gap-2.5 sm:gap-3" data-testid="text-game-brand">
            <span className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#f27b4e]/70 bg-[#f27b4e]/10">
              <span className="h-2 w-2 rounded-full bg-[#ffc077] shadow-[0_0_12px_#f27b4e]" />
            </span>
            <div>
              <div className="game-display text-sm sm:text-base font-semibold tracking-[0.16em] text-[#f4efe5]">
                ENDLESS GRAPPLE
              </div>
              <div className="game-mono text-[9px] text-[#78b7b4]">DUSK SECTOR CHALLENGE</div>
            </div>
          </div>
          <div className="game-mono hidden text-[10px] uppercase text-[#7f93b5] sm:block">
            Flight log <span className="text-[#f27b4e]">•</span> 90s attempt window
          </div>
        </header>

        {/* Stage Container */}
        <div
          ref={stageRef}
          className="relative z-0 min-h-0 flex-1 touch-none overflow-hidden"
          aria-label="Endless Grapple game canvas"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
            data-testid="game-canvas"
            aria-label="Playable grappling game"
          />

          {/* In-Game HUD */}
          <div className="pointer-events-none absolute inset-x-4 top-3 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-4">
            <div className="hud-card flex items-center divide-x divide-[#91a8cd]/20 rounded-xl">
              <div className="px-3 py-2 sm:px-4">
                <div className="game-mono text-[9px] uppercase text-[#7f93b5]">time</div>
                <span ref={timeRef} className="game-mono text-xs sm:text-sm font-bold text-[#f4efe5]" data-testid="status-time">
                  90.0s
                </span>
              </div>
              <div className="px-3 py-2 sm:px-4">
                <div className="game-mono text-[9px] uppercase text-[#7f93b5]">distance</div>
                <span ref={distanceRef} className="game-mono text-xs sm:text-sm font-bold text-[#ffc077]" data-testid="status-distance">
                  0m
                </span>
              </div>
            </div>
            <div className="hud-card rounded-xl px-3 py-2 text-right sm:px-4">
              <div className="game-mono text-[9px] uppercase text-[#7f93b5]">attempt</div>
              <span ref={attemptRef} className="game-mono text-xs sm:text-sm font-bold text-[#78b7b4]" data-testid="status-attempt">
                {attempt} / {MAX_ATTEMPTS}
              </span>
            </div>
          </div>

          {/* Ready Overlay */}
          {phase === "ready" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 bg-[#0a1228]/40">
              <div className="animate-[grapple-rise_500ms_ease-out] text-center max-w-md">
                <div className="game-mono mb-3 text-[10px] uppercase tracking-[0.24em] text-[#78b7b4]" data-testid="status-ready">
                  Flight Window Open
                </div>
                <h2 className="game-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#f4efe5] leading-tight">
                  Catch the<br />
                  <span className="text-[#f27b4e]">next line.</span>
                </h2>
                <p className="mx-auto mt-3 sm:mt-4 max-w-sm text-xs sm:text-sm leading-relaxed text-[#a2b1c9]">
                  Hold to attach. Release to launch. Stay airborne across the skyline.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.16em] text-[#d5d9d9]">
                  <span className="rounded-md border border-[#91a8cd]/30 bg-[#17254a]/90 px-2.5 py-1 font-mono text-xs">
                    SPACE
                  </span>
                  <span className="text-[#7f93b5]">or</span>
                  <span className="rounded-md border border-[#91a8cd]/30 bg-[#17254a]/90 px-2.5 py-1 font-mono text-xs">
                    CLICK / TOUCH
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Playing Bottom Hint */}
          {phase === "playing" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center sm:bottom-6">
              <div className="flex items-center gap-2 rounded-full border border-[#91a8cd]/20 bg-[#0d1530]/70 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-[grapple-pulse_1.4s_ease-in-out_infinite] rounded-full bg-[#f27b4e]" />
                <span className="game-mono text-[9px] uppercase tracking-[0.16em] text-[#a2b1c9]">
                  hold to grapple • release to fly
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="relative z-10 flex items-center justify-between px-4 py-2 sm:px-6 sm:py-2.5 bg-[#0a1228]/80 border-t border-[#91a8cd]/15">
          <div className="game-mono text-[9px] uppercase tracking-[0.15em] text-[#5c729d]">
            Max 2 attempts • Best distance counts
          </div>
          <div className="game-mono text-[9px] uppercase tracking-[0.15em] text-[#5c729d]">
            touch / mouse / space
          </div>
        </footer>

        {/* Result & Retry Modal */}
        {isResult && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-[#081129]/80 px-4 backdrop-blur-[4px]"
            data-testid={`status-${phase}`}
          >
            <div className="hud-card relative w-full max-w-md overflow-hidden rounded-2xl p-6 text-center shadow-2xl sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f27b4e] to-transparent" />
              <div className="game-mono text-[10px] uppercase tracking-[0.24em] text-[#78b7b4]">
                {phase === "retry" ? "Attempt 01 Ended" : "Run Complete"}
              </div>
              <h3 className="game-display mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#f4efe5]">
                {phase === "retry" ? "ATTEMPT 01 COMPLETE" : "FINAL RESULT RECORDED"}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-xs sm:text-sm leading-relaxed text-[#a2b1c9]">
                {phase === "retry"
                  ? "Your distance is recorded. You have 1 final retry remaining."
                  : "Two attempts completed. Best distance is locked in."}
              </p>

              <div className="my-5 grid grid-cols-3 divide-x divide-[#91a8cd]/20 border-y border-[#91a8cd]/20 py-3.5">
                <div>
                  <div className="game-mono text-[9px] uppercase text-[#7f93b5]">best distance</div>
                  <div className="game-display mt-1 text-xl sm:text-2xl text-[#ffc077]" data-testid="status-best-distance">
                    {Math.floor(result.distance).toLocaleString()}<span className="ml-0.5 text-xs text-[#f27b4e]">m</span>
                  </div>
                </div>
                <div>
                  <div className="game-mono text-[9px] uppercase text-[#7f93b5]">score</div>
                  <div className="game-display mt-1 text-xl sm:text-2xl text-[#ffc077]" data-testid="status-score">
                    {Math.floor(result.distance).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="game-mono text-[9px] uppercase text-[#7f93b5]">xp earned</div>
                  <div className="game-display mt-1 text-xl sm:text-2xl text-[#78b7b4]" data-testid="status-xp">
                    {result.xp}
                  </div>
                </div>
              </div>

              {phase === "retry" ? (
                <button
                  type="button"
                  className="game-button w-full rounded-lg bg-[#f27b4e] px-5 py-3 text-sm font-bold tracking-[0.08em] text-[#111a37] shadow-[0_10px_24px_rgba(242,123,78,0.25)] cursor-pointer"
                  data-testid="button-retry-run"
                  onClick={() => startAttemptRef.current(2)}
                >
                  TAKE SECOND ATTEMPT →
                </button>
              ) : (
                <div className="game-mono flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#78b7b4] mt-2" data-testid="status-final">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#78b7b4]" />
                  Final Result Locked • Scrolling to Details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
