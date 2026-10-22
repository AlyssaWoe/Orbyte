/**
 * Orbyte Smart Payment Follow-up AI - 3D Minecraft / Voxel Campus (English Edition)
 * Highly active voxel characters with explicit floating responsibility billboard labels,
 * distinctive props, pacing animations, greeting waves, and animated action execution.
 */

class Office3DScene {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.agents = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();

    // Player character
    this.player = null;
    this.playerSpeed = 9.5;
    this.keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, e: false };

    // Nearest interactive agent
    this.nearestAgent = null;

    // Camera smoothing
    this.cameraTargetPos = null;
    this.controlsTargetPos = null;
    this.isLerpingCamera = false;

    this.init();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd9f5de);
    this.scene.fog = new THREE.FogExp2(0xd9f5de, 0.010);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 600);
    this.camera.position.set(36, 28, 44);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxPolarAngle = Math.PI / 2.12;
      this.controls.minDistance = 8;
      this.controls.maxDistance = 110;
      this.controls.target.set(0, 1.5, 0);
    }

    // 5. Daylight Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa7f3d0, 0.45);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 0.95);
    sunLight.position.set(32, 48, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 160;
    const d = 40;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // 6. Build Voxel World & Campus
    this.buildWorld();

    // 7. Event Handlers
    window.addEventListener('resize', () => this.onResize());
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));
    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = true;
      if (e.key === 'e' || e.key === 'E') {
        if (this.nearestAgent) {
          this.openAgentActionModal(this.nearestAgent);
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = false;
    });

    // 8. Start Loop
    this.animate();
  }

  buildWorld() {
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

    // Ground Plane
    const ground = new THREE.Mesh(new THREE.BoxGeometry(82, 2, 82), grassMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Cobblestone Walkways
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 72), stoneMat);
    p1.position.set(0, 0.05, 0);
    p1.receiveShadow = true;
    this.scene.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(72, 0.1, 10), stoneMat);
    p2.position.set(0, 0.05, 0);
    p2.receiveShadow = true;
    this.scene.add(p2);

    // Central Courtyard Pond
    const pond = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 9), stoneMat);
    pond.position.set(0, 0.2, 0);
    this.scene.add(pond);

    const water = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.45, 7.8), waterMat);
    water.position.set(0, 0.25, 0);
    this.scene.add(water);

    // Trees
    this.createTree(-26, -22);
    this.createTree(-26, 22);
    this.createTree(26, -22);
    this.createTree(26, 22);
    this.createTree(-10, -28);
    this.createTree(10, -28);

    // Entrance Arch (South)
    this.createEntranceArch(0, 30);

    // 7 Production Agents with High Activity & Explicit Responsibility Labels
    this.createAgent1Ingestion(-16, -14);
    this.createAgent2Monitoring(0, -18);
    this.createAgent3Laya(16, -14);
    this.createAgent4DeepSeek(18, 0);
    this.createAgent5Collection(16, 16);
    this.createAgent6Reconciliation(-16, 16);
    this.createAgent7Orchestrator(-18, 0);

    // Player Avatar (Visitor)
    this.createPlayerAvatar(0, 10);
  }

  createTree(x, z) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), trunkMat);
    trunk.position.set(x, 2, z);
    trunk.castShadow = true;
    this.scene.add(trunk);

    const leaf1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3, 4.2), leafMat);
    leaf1.position.set(x, 4.5, z);
    leaf1.castShadow = true;
    this.scene.add(leaf1);

    const leaf2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2, 2.8), leafMat);
    leaf2.position.set(x, 6.2, z);
    leaf2.castShadow = true;
    this.scene.add(leaf2);
  }

  createEntranceArch(x, z) {
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.5, 1.4), stoneMat);
    p1.position.set(x - 3.2, 2.75, z);
    p1.castShadow = true;
    this.scene.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.5, 1.4), stoneMat);
    p2.position.set(x + 3.2, 2.75, z);
    p2.castShadow = true;
    this.scene.add(p2);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 1.4), stoneMat);
    lintel.position.set(x, 6, z);
    lintel.castShadow = true;
    this.scene.add(lintel);
  }

  buildBaseCharacter(shirtColor, pantsColor) {
    const g = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3f2e1e });
    const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), skinMat);
    head.position.y = 2.45;
    head.castShadow = true;
    g.add(head);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.35, 0.96), hairMat);
    hair.position.y = 2.85;
    g.add(hair);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.6), shirtMat);
    torso.position.y = 1.4;
    torso.castShadow = true;
    g.add(torso);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), shirtMat);
    leftArm.position.set(-0.7, 1.35, 0);
    leftArm.castShadow = true;
    g.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), shirtMat);
    rightArm.position.set(0.7, 1.35, 0);
    rightArm.castShadow = true;
    g.add(rightArm);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 0.45), pantsMat);
    leftLeg.position.set(-0.25, 0.55, 0);
    leftLeg.castShadow = true;
    g.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 0.45), pantsMat);
    rightLeg.position.set(0.25, 0.55, 0);
    rightLeg.castShadow = true;
    g.add(rightLeg);

    g.userData = { head, torso, leftArm, rightArm, leftLeg, rightLeg };
    return g;
  }

  // Create High-Resolution Billboard Sprite Label clearly stating agent responsibilities
  createAgentBillboardLabel(title, responsibilityText, badgeColorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    // Rounded rectangle background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = badgeColorHex || '#15803d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(10, 10, 620, 220, 24);
    ctx.fill();
    ctx.stroke();

    // Top Header Badge
    ctx.fillStyle = badgeColorHex || '#15803d';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 320, 58);

    // Divider Line
    ctx.strokeStyle = '#e2f2e5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 80);
    ctx.lineTo(600, 80);
    ctx.stroke();

    // Responsibility Label Header
    ctx.fillStyle = '#4b6b55';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('RESPONSIBILITY / DUTY:', 320, 118);

    // Responsibility Description Text
    ctx.fillStyle = '#143521';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(responsibilityText, 320, 160);

    // Status Pill
    ctx.fillStyle = '#dcfce7';
    ctx.beginPath();
    ctx.roundRect(220, 185, 200, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('● ACTIVE & READY', 320, 208);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(6.4, 2.4, 1);
    sprite.position.y = 4.8;

    return sprite;
  }

  // --- 1. Agent 1: Ingestion & Validation ---
  createAgent1Ingestion(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const scanner = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.0), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
    scanner.position.set(1.4, 1.6, 0);
    group.add(scanner);

    const scanLight = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    scanLight.rotation.x = -Math.PI / 2;
    scanLight.position.set(1.4, 1.76, 0);
    group.add(scanLight);

    const papers = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
    papers.position.set(-1.4, 1.6, 0);
    group.add(papers);

    const char = this.buildBaseCharacter(0x16a34a, 0x15803d);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const docSheet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    docSheet.position.set(0, -0.5, 0.3);
    char.userData.rightArm.add(docSheet);

    // Floating Clear Billboard Label
    const billboard = this.createAgentBillboardLabel("Agent 1: Ingestion & Validation", "Docling OCR + Pydantic Schema Check", "#15803d");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 1,
      name: "Agent 1: Ingestion & Validation",
      role: "Docling layout extraction + Pydantic validation + Duplicate check",
      tasks: [
        "📄 Ingest & parse uploaded invoices (Docling OCR & layout)",
        "🔍 Validate invoice ID, date normalization & item sum balancing (Pydantic)",
        "🛑 Route conflicting or incomplete records to exception review (NEEDS_DATA_REVIEW)"
      ],
      actionName: "📥 Execute: Ingest & Validate Invoice",
      color: "#15803d",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "scan_paper",
      docSheet, scanLight,
      paceOffset: 0,
      paceDir: 1
    });
  }

  // --- 2. Agent 2: Payment Monitoring ---
  createAgent2Monitoring(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const board = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 0.1), new THREE.MeshLambertMaterial({ color: 0x0f766e }));
    board.position.set(0, 2.5, -2.5);
    group.add(board);

    const clockMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    clockMesh.rotation.x = Math.PI / 2;
    clockMesh.position.set(0, 4.0, -2.5);
    group.add(clockMesh);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const char = this.buildBaseCharacter(0x14b8a6, 0x0d9488);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const clipboard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.08), new THREE.MeshLambertMaterial({ color: 0x78350f }));
    clipboard.position.set(0, -0.5, 0.3);
    char.userData.leftArm.add(clipboard);

    const billboard = this.createAgentBillboardLabel("Agent 2: Payment Monitoring", "Aging Calculations & Quiet Hours Scheduler", "#0d9488");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 2,
      name: "Agent 2: Payment Monitoring & Aging",
      role: "PostgreSQL polling + Deterministic aging calculations + Quiet hours (9am-6pm)",
      tasks: [
        "⏰ Periodically evaluate due dates, categorize upcoming vs overdue accounts",
        "⚠️ Prominently flag overdue invoices with direct customer profile links",
        "🛑 Enforce stop-collection conditions during active disputes or payment promises"
      ],
      actionName: "⚡ Execute: Scan Aging & Reminder Schedule",
      color: "#0d9488",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "check_clock",
      paceOffset: 0,
      paceDir: 1
    });
  }

  // --- 3. Agent 3: Laya Decision ---
  createAgent3Laya(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const s1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.08), new THREE.MeshBasicMaterial({ color: 0x8b5cf6 }));
    s1.position.set(-1.2, 2.2, -0.5);
    s1.rotation.y = 0.3;
    group.add(s1);

    const s2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.08), new THREE.MeshBasicMaterial({ color: 0xa78bfa }));
    s2.position.set(1.2, 2.2, -0.5);
    s2.rotation.y = -0.3;
    group.add(s2);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const char = this.buildBaseCharacter(0x8b5cf6, 0x7c3aed);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const billboard = this.createAgentBillboardLabel("Agent 3: Laya Decision & Routing", "NAR Option Scoring & Calibrated Routing", "#7c3aed");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 3,
      name: "Agent 3: Laya Decision & Routing",
      role: "Non-autoregressive scoring + 0.75 calibration threshold + Safe fallback",
      tasks: [
        "🎯 Score inbound event texts across candidate labels",
        "📊 Apply non-autoregressive temperature calibration matrix",
        "🔀 Route to Agent 4 (Reply), Agent 6 (Reconcile), or Human Review"
      ],
      actionName: "🎯 Execute: Laya Scoring & Route Determination",
      color: "#7c3aed",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "point_screens",
      paceOffset: 0,
      paceDir: 1
    });
  }

  // --- 4. Agent 4: DeepSeek Customer Reply ---
  createAgent4DeepSeek(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const chatScreen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.1), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    chatScreen.position.set(0, 2.1, -0.4);
    group.add(chatScreen);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const char = this.buildBaseCharacter(0x38bdf8, 0x0284c7);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const billboard = this.createAgentBillboardLabel("Agent 4: Reply Understanding", "DeepSeek Intent Extraction & Injection Defense", "#0284c7");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 4,
      name: "Agent 4: DeepSeek Reply Understanding",
      role: "NLP intent extraction + Prompt injection defense + Coordinated Agent 5 reply drafting",
      tasks: [
        "💬 Display latest customer communication transcripts & context",
        "🧠 AI summary of core intent, claims, and promised payment dates",
        "✉️ Coordinate with Agent 5 to draft tailored responses matching intent"
      ],
      actionName: "💬 Execute: Analyze Reply & Draft Follow-up",
      color: "#0284c7",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "read_chat",
      paceOffset: 0,
      paceDir: 1
    });
  }

  // --- 5. Agent 5: Collection Strategy ---
  createAgent5Collection(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const letter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 1.1), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    letter.position.set(0, 1.42, 0);
    group.add(letter);

    const char = this.buildBaseCharacter(0x4ade80, 0x16a34a);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const stampProp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.4), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
    stampProp.position.set(0, -0.5, 0.2);
    char.userData.rightArm.add(stampProp);

    const billboard = this.createAgentBillboardLabel("Agent 5: Collection Strategy", "Tone Selection & Risk-Gated Message Drafting", "#16a34a");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 5,
      name: "Agent 5: Collection Strategy & Follow-up",
      role: "Aging-bracket tone selection + Risk threshold checks (> $5k approval) + Communication limits",
      tasks: [
        "✍️ Draft gentle reminders, polite follow-ups, or formal demand notices",
        "🛡️ Deterministic pre-checks: quiet hours, dispute holds, frequency limits",
        "📋 Flag accounts > 14 days overdue or high value for Agent 7 supervisor review"
      ],
      actionName: "✉️ Execute: Draft Strategy & Request Approval",
      color: "#16a34a",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "stamp_letter",
      stampProp,
      paceOffset: 0,
      paceDir: 1
    });
  }

  // --- 6. Agent 6: Payment Reconciliation ---
  createAgent6Reconciliation(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const coinMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    for (let c = 0; c < 3; c++) {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4 + c * 0.2), coinMat);
      stack.position.set(-1.2 + c * 0.5, 1.6 + c * 0.1, 0);
      group.add(stack);
    }

    const char = this.buildBaseCharacter(0xfde047, 0xca8a04);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const billboard = this.createAgentBillboardLabel("Agent 6: Payment Reconciliation", "Multi-Tier Bank Matching & Financial Ledger", "#ca8a04");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 6,
      name: "Agent 6: Payment Reconciliation & Ledger Records",
      role: "Bank feed ingestion + Multi-tier deterministic matching + Explicit ledger accounting",
      tasks: [
        "🏦 Clearly list every bank transaction & matched receipt evidence",
        "🔍 Tier 1 reference matching / Tier 2 alias balance tolerance (±$0.05)",
        "💰 Deduct partial payments; strictly deterministic financial ledger updates"
      ],
      actionName: "💰 Execute: Reconcile Bank Transactions",
      color: "#ca8a04",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "count_coins",
      paceOffset: 0,
      paceDir: 1
    });
  }

  // --- 7. Agent 7: Orchestrator ---
  createAgent7Orchestrator(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    plat.position.y = 0.1;
    group.add(plat);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.8), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
    desk.position.set(0, 1.4, 0);
    group.add(desk);

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    orb.position.set(0, 2.4, 0);
    group.add(orb);

    const char = this.buildBaseCharacter(0xfb923c, 0xea580c);
    char.position.set(0, 0, 1.4);
    group.add(char);

    const billboard = this.createAgentBillboardLabel("Agent 7: LangGraph Orchestrator", "15-State Coordination, HITL Approvals & Audit", "#ea580c");
    group.add(billboard);

    this.scene.add(group);
    this.registerAgent({
      id: 7,
      name: "Agent 7: Orchestrator, Approvals & Audit",
      role: "LangGraph state machine + Human-in-the-loop pauses + Immutable audit trail",
      tasks: [
        "🎛️ Coordinate 15-state lifecycle from intake to closed",
        "⏸️ Interrupt workflow for human review on high-risk actions",
        "🛡️ Log cryptographic idempotency keys & tamper-proof audit trails"
      ],
      actionName: "🚀 Execute: Run Full Pipeline Step",
      color: "#ea580c",
      group, char, billboard,
      basePos: new THREE.Vector3(x, 0, z),
      actionType: "conduct_orchestrator",
      orb,
      paceOffset: 0,
      paceDir: 1
    });
  }

  registerAgent(agentConfig) {
    agentConfig.group.traverse(child => {
      if (child.isMesh) {
        child.userData = { isAgent: true, agentData: agentConfig };
      }
    });

    this.agents.push(agentConfig);
  }

  createPlayerAvatar(x, z) {
    const avatar = this.buildBaseCharacter(0x059669, 0x1e293b);
    avatar.position.set(x, 0, z);
    this.scene.add(avatar);
    this.player = avatar;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  onPointerClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);

    for (let hit of hits) {
      let cur = hit.object;
      while (cur && !cur.userData.isAgent && cur.parent) cur = cur.parent;
      if (cur && cur.userData.isAgent) {
        this.openAgentActionModal(cur.userData.agentData);
        return;
      }
    }
  }

  openAgentActionModal(agentData) {
    if (window.app) {
      window.app.showAgentActionModal(agentData);
    }
  }

  playAgentExecutionAnimation(agentData, callback) {
    agentData.isExecutingWork = true;
    agentData.workStartTime = this.clock.getElapsedTime();

    setTimeout(() => {
      agentData.isExecutingWork = false;
      if (callback) callback();
    }, 700);
  }

  resetCamera() {
    this.cameraTargetPos = new THREE.Vector3(36, 28, 44);
    this.controlsTargetPos = new THREE.Vector3(0, 1.5, 0);
    this.isLerpingCamera = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // 1. Camera lerp
    if (this.isLerpingCamera && this.cameraTargetPos && this.controlsTargetPos) {
      this.camera.position.lerp(this.cameraTargetPos, 0.08);
      this.controls.target.lerp(this.controlsTargetPos, 0.08);
      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.2) {
        this.isLerpingCamera = false;
      }
    }

    if (this.controls) this.controls.update();

    // 2. Player movements
    let nearest = null;
    let minDistance = 999;

    if (this.player) {
      let moveX = 0;
      let moveZ = 0;
      const speed = this.playerSpeed * delta;

      if (this.keys.w || this.keys.ArrowUp) moveZ -= speed;
      if (this.keys.s || this.keys.ArrowDown) moveZ += speed;
      if (this.keys.a || this.keys.ArrowLeft) moveX -= speed;
      if (this.keys.d || this.keys.ArrowRight) moveX += speed;

      if (moveX !== 0 || moveZ !== 0) {
        this.player.position.x += moveX;
        this.player.position.z += moveZ;

        this.player.position.x = Math.max(-36, Math.min(36, this.player.position.x));
        this.player.position.z = Math.max(-36, Math.min(36, this.player.position.z));

        const swing = Math.sin(elapsed * 12) * 0.45;
        const limbs = this.player.userData;
        if (limbs.leftLeg) limbs.leftLeg.rotation.x = swing;
        if (limbs.rightLeg) limbs.rightLeg.rotation.x = -swing;
        if (limbs.leftArm) limbs.leftArm.rotation.x = -swing;
        if (limbs.rightArm) limbs.rightArm.rotation.x = swing;

        this.player.rotation.y = Math.atan2(moveX, moveZ);
      } else {
        const breathe = Math.sin(elapsed * 2.5) * 0.04;
        this.player.position.y = breathe;
      }

      for (let a of this.agents) {
        const d = this.player.position.distanceTo(a.basePos);
        if (d < minDistance) {
          minDistance = d;
          if (d <= 5.8) nearest = a;
        }
      }
    }

    this.nearestAgent = nearest;
    if (window.app) {
      window.app.updateProximityPrompt(nearest);
    }

    // 3. Highly Active & Dynamic Agent Animations + Billboard Floating
    for (let i = 0; i < this.agents.length; i++) {
      const a = this.agents[i];
      const u = a.char.userData;
      const isPlayerNear = (this.nearestAgent === a);

      // Billboard label gentle floating
      if (a.billboard) {
        a.billboard.position.y = 4.8 + Math.sin(elapsed * 2.5 + i) * 0.12;
      }

      // Scanner light pulsing for Agent 1
      if (a.scanLight) {
        a.scanLight.material.opacity = 0.3 + Math.abs(Math.sin(elapsed * 5)) * 0.5;
      }

      // Interactive Greeting: If player is nearby, wave enthusiastically!
      if (isPlayerNear && !a.isExecutingWork) {
        const toPlayer = this.player.position.clone().sub(a.basePos);
        const lookAngle = Math.atan2(toPlayer.x, toPlayer.z);
        u.head.rotation.y = THREE.MathUtils.lerp(u.head.rotation.y, lookAngle, 0.1);

        u.rightArm.rotation.x = -1.6 + Math.sin(elapsed * 10) * 0.4;
        u.rightArm.rotation.z = Math.sin(elapsed * 12) * 0.3;
        u.leftArm.rotation.x = -0.2;

        a.char.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.15;
        continue;
      }

      if (a.isExecutingWork) {
        a.char.position.y = Math.abs(Math.sin(elapsed * 12)) * 0.15;
        if (a.actionType === "scan_paper") {
          u.rightArm.rotation.x = -1.4 + Math.sin(elapsed * 22) * 0.5;
          u.head.rotation.x = 0.35;
        } else if (a.actionType === "stamp_letter") {
          u.rightArm.rotation.x = Math.sin(elapsed * 20) > 0 ? -1.2 : -0.1;
        } else {
          u.rightArm.rotation.x = -1.1 + Math.sin(elapsed * 16) * 0.4;
          u.leftArm.rotation.x = -1.1 + Math.cos(elapsed * 16) * 0.4;
        }
      } else {
        // Continuous lively pacing & expressive gestures
        a.paceOffset += a.paceDir * 0.015;
        if (Math.abs(a.paceOffset) > 1.4) {
          a.paceDir *= -1;
        }
        a.char.position.x = a.paceOffset;
        a.char.rotation.y = (a.paceDir > 0) ? Math.PI / 2 : -Math.PI / 2;

        const legSwing = Math.sin(elapsed * 8) * 0.35;
        u.leftLeg.rotation.x = legSwing;
        u.rightLeg.rotation.x = -legSwing;
        a.char.position.y = Math.abs(Math.sin(elapsed * 8)) * 0.08;

        if (a.actionType === "scan_paper") {
          u.rightArm.rotation.x = -0.8 + Math.sin(elapsed * 4) * 0.4;
          u.leftArm.rotation.x = -0.3 + Math.cos(elapsed * 3) * 0.2;
          u.head.rotation.x = 0.25 + Math.sin(elapsed * 2) * 0.15;
        } else if (a.actionType === "check_clock") {
          u.head.rotation.x = -0.4 + Math.sin(elapsed * 3) * 0.25;
          u.leftArm.rotation.x = -0.7 + Math.sin(elapsed * 6) * 0.25;
          u.rightArm.rotation.x = Math.sin(elapsed * 5) * 0.3;
        } else if (a.actionType === "point_screens") {
          u.leftArm.rotation.x = -1.0 + Math.sin(elapsed * 3.5) * 0.4;
          u.rightArm.rotation.x = -1.0 + Math.cos(elapsed * 3.5) * 0.4;
          u.head.rotation.y = Math.sin(elapsed * 3) * 0.4;
        } else if (a.actionType === "read_chat") {
          u.head.rotation.y = Math.sin(elapsed * 2.5) * 0.3;
          u.head.rotation.z = Math.sin(elapsed * 2) * 0.18;
          u.rightArm.rotation.x = -0.6 + Math.sin(elapsed * 4) * 0.2;
        } else if (a.actionType === "stamp_letter") {
          u.rightArm.rotation.x = -0.7 + Math.sin(elapsed * 5) * 0.35;
          u.leftArm.rotation.x = -0.4;
          u.head.rotation.x = 0.3;
        } else if (a.actionType === "count_coins") {
          u.leftArm.rotation.x = -0.8 + Math.sin(elapsed * 6) * 0.3;
          u.rightArm.rotation.x = -0.8 + Math.cos(elapsed * 6) * 0.3;
          u.head.rotation.x = 0.35;
        } else if (a.actionType === "conduct_orchestrator") {
          u.leftArm.rotation.x = -1.0 + Math.sin(elapsed * 3) * 0.5;
          u.rightArm.rotation.x = -1.0 + Math.sin(elapsed * 3 + 1.2) * 0.5;
          u.head.rotation.y = Math.sin(elapsed * 2) * 0.2;
          if (a.orb) a.orb.scale.setScalar(1.0 + Math.sin(elapsed * 4) * 0.16);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Office3DScene = Office3DScene;
