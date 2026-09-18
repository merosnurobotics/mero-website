// ============================================================
//  MERO club homepage content data
//  Edit this file to update the homepage content directly.
//  (Editing and committing this file on GitHub auto-deploys via Vercel)
// ============================================================

export const site = {
  name: "MERO",
  tagline: "A robotics & maker club that builds, experiments, and grows together",
  description:
    "MERO is a community of people who turn ideas into things with their own hands. We move freely across robotics, embedded systems, and software, taking on projects and competitions every semester.",
  // Top navigation menu (each item links to a separate page)
  nav: [
    { label: "About", href: "/about" },
    { label: "Equipment", href: "/equipment" },
    { label: "Projects", href: "/projects" },
    { label: "Events", href: "/events" },
    { label: "People", href: "/people" },
    { label: "Schedule", href: "/schedule" },
    { label: "Support club", href: "/support" },
  ],
  // Key figures shown in the hero section
  stats: [
    { value: "40", label: "Active members" },
    { value: "12", label: "Ongoing projects" },
    { value: "9", label: "Competitions & events" },
    { value: "2018", label: "Founded" },
  ],
};

// ------------------------------------------------------------
//  About — what we do
// ------------------------------------------------------------
export const about = [
  {
    title: "Robotics",
    desc: "We design and build hardware and control systems ourselves, including autonomous robots, robotic arms, and drones.",
    icon: "robot",
  },
  {
    title: "Embedded · IoT",
    desc: "We use sensors and microcontrollers to build systems that connect the physical world with software.",
    icon: "chip",
  },
  {
    title: "Software",
    desc: "From web and apps to computer vision and data, we write all the code needed to complete a project together.",
    icon: "code",
  },
];

// ------------------------------------------------------------
//  People — current members and alumni
//  Add or edit a person by changing a line below.
//  - name:  full name shown under the photo
//  - role:  their role in the club (e.g. "President", "Robotics Lead")
//  - year:  the class/cohort year, or a range for alumni (e.g. "2019–2022")
//  - image: path to a photo in /public/people (replace with your own)
//  Split into two lists: `current` (active) and `alumni` (past members).
// ------------------------------------------------------------
export const people = {
  advisors: [
    { name: "Prof. Jaehyun Moon", role: "Faculty Advisor", year: "Dept. of Mechanical Eng.", image: "/people/jaehyun-moon.svg" },
    { name: "Prof. Hyeri Baek", role: "Faculty Advisor", year: "Dept. of Electrical Eng.", image: "/people/hyeri-baek.svg" },
  ],
  current: [
    { name: "Jiwon Park", role: "President", year: "2023", image: "/people/jiwon-park.svg" },
    { name: "Minseok Lee", role: "Vice President", year: "2023", image: "/people/minseok-lee.svg" },
    { name: "Soyeon Kim", role: "Robotics Lead", year: "2024", image: "/people/soyeon-kim.svg" },
    { name: "Hyunwoo Choi", role: "Embedded Lead", year: "2024", image: "/people/hyunwoo-choi.svg" },
    { name: "Dahye Jung", role: "Software Lead", year: "2024", image: "/people/dahye-jung.svg" },
    { name: "Junho Kang", role: "Treasurer", year: "2025", image: "/people/junho-kang.svg" },
    { name: "Yerin Han", role: "Member", year: "2025", image: "/people/yerin-han.svg" },
    { name: "Taeyang Seo", role: "Member", year: "2025", image: "/people/taeyang-seo.svg" },
  ],
  alumni: [
    { name: "Woojin Yoon", role: "Founder · President", year: "2018–2021", image: "/people/woojin-yoon.svg" },
    { name: "Eunji Shin", role: "Robotics Lead", year: "2019–2022", image: "/people/eunji-shin.svg" },
    { name: "Sangmin Oh", role: "Software Lead", year: "2020–2023", image: "/people/sangmin-oh.svg" },
    { name: "Nari Cho", role: "President", year: "2021–2023", image: "/people/nari-cho.svg" },
  ],
};

// ------------------------------------------------------------
//  Equipment
//  - slug:  unique id used for the detail page URL (/equipment/<slug>)
//  - image: path to a photo in the /public folder (replace with your own)
//  - detail: longer description shown on the detail page
//  - specs: list of { label, value } rows shown on the detail page
// ------------------------------------------------------------
export const equipment = [
  {
    slug: "3d-printers",
    name: "3D Printers",
    model: "Bambu Lab X1C · Prusa MK4",
    qty: 4,
    tag: "Fabrication",
    image: "/equipment/3d-printers.svg",
    detail:
      "Our fleet of FDM printers lets multiple teams prototype in parallel. From quick draft parts to production-quality enclosures, we print in PLA, PETG, and TPU almost every day.",
    specs: [
      { label: "Build volume", value: "256 × 256 × 256 mm" },
      { label: "Materials", value: "PLA · PETG · TPU · ABS" },
      { label: "Nozzle", value: "0.4 mm (swappable)" },
    ],
  },
  {
    slug: "laser-cutter",
    name: "Laser Cutter",
    model: "FSL Muse 3D",
    qty: 1,
    tag: "Fabrication",
    image: "/equipment/laser-cutter.svg",
    detail:
      "A CO2 laser cutter for acrylic, plywood, and cardboard. Great for enclosures, gears, and precise flat parts that would be slow to print.",
    specs: [
      { label: "Work area", value: "500 × 300 mm" },
      { label: "Laser", value: "40W CO2" },
      { label: "Materials", value: "Acrylic · Wood · Paper" },
    ],
  },
  {
    slug: "oscilloscopes",
    name: "Oscilloscopes",
    model: "Rigol DS1054Z",
    qty: 3,
    tag: "Measurement",
    image: "/equipment/oscilloscopes.svg",
    detail:
      "Four-channel digital oscilloscopes for debugging analog and digital circuits, checking signal integrity, and teaching electronics fundamentals.",
    specs: [
      { label: "Bandwidth", value: "50 MHz" },
      { label: "Channels", value: "4" },
      { label: "Sample rate", value: "1 GSa/s" },
    ],
  },
  {
    slug: "soldering-stations",
    name: "Soldering Stations",
    model: "Hakko FX-888D",
    qty: 6,
    tag: "Fabrication",
    image: "/equipment/soldering-stations.svg",
    detail:
      "Temperature-controlled soldering stations at our electronics bench for through-hole and surface-mount work.",
    specs: [
      { label: "Temp range", value: "200–480 °C" },
      { label: "Stations", value: "6 seats" },
      { label: "Tips", value: "Fine · Chisel · Bevel" },
    ],
  },
  {
    slug: "embedded-boards",
    name: "Embedded Boards",
    model: "Raspberry Pi 5 · Jetson Orin Nano",
    qty: 12,
    tag: "Computing",
    image: "/equipment/embedded-boards.svg",
    detail:
      "A shared pool of single-board computers and microcontrollers for robotics, computer vision, and IoT projects. Members can check them out for a semester.",
    specs: [
      { label: "SBCs", value: "Raspberry Pi 5 · Jetson Orin Nano" },
      { label: "MCUs", value: "ESP32 · STM32 · Arduino" },
      { label: "Available units", value: "12" },
    ],
  },
  {
    slug: "drone-platforms",
    name: "Drone Platforms",
    model: "DJI Tello · Custom FPV",
    qty: 5,
    tag: "Flight",
    image: "/equipment/drone-platforms.svg",
    detail:
      "Ready-to-fly and custom-built drones for programming practice, aerial imaging, and FPV racing experiments.",
    specs: [
      { label: "Ready-to-fly", value: "DJI Tello" },
      { label: "Custom", value: "5-inch FPV quad" },
      { label: "Control", value: "SDK · Betaflight" },
    ],
  },
  {
    slug: "robotic-arms",
    name: "Robotic Arms",
    model: "Dobot Magician",
    qty: 2,
    tag: "Robotics",
    image: "/equipment/robotic-arms.svg",
    detail:
      "Desktop robotic arms used for pick-and-place demos, motion planning, and human-robot interaction projects.",
    specs: [
      { label: "Reach", value: "320 mm" },
      { label: "Payload", value: "500 g" },
      { label: "Axes", value: "4" },
    ],
  },
  {
    slug: "power-tool-set",
    name: "Power Tool Set",
    model: "Drill · Grinder · Band saw",
    qty: 1,
    tag: "Machining",
    image: "/equipment/power-tool-set.svg",
    detail:
      "A basic workshop corner for cutting, drilling, and finishing metal and wood parts that finish off a build.",
    specs: [
      { label: "Cutting", value: "Band saw · Angle grinder" },
      { label: "Drilling", value: "Bench + hand drill" },
      { label: "Safety", value: "Goggles · Gloves provided" },
    ],
  },
];

// ------------------------------------------------------------
//  Projects
//  - slug:  unique id used for the detail page URL (/projects/<slug>)
//  - image: path to a photo in the /public folder (replace with your own)
//  - detail: longer description shown on the detail page
//  - highlights: bullet points shown on the detail page
//  - team: who worked on it (free text)
// ------------------------------------------------------------
export const projects = [
  {
    slug: "autonomous-delivery-robot",
    title: "Autonomous Delivery Robot",
    period: "Spring 2025",
    status: "In progress",
    desc: "A delivery robot that navigates indoors and outdoors on campus using LiDAR- and camera-based SLAM.",
    tags: ["ROS2", "LiDAR", "Computer Vision"],
    image: "/projects/autonomous-delivery-robot.svg",
    detail:
      "We're building a wheeled robot that can carry small packages between campus buildings on its own. It fuses LiDAR and camera data for mapping and obstacle avoidance, and plans routes with a ROS2 navigation stack.",
    highlights: [
      "Real-time SLAM with sensor fusion",
      "Autonomous path planning and re-routing",
      "Custom chassis with a lockable cargo bay",
    ],
    team: "Robotics team · 6 members",
  },
  {
    slug: "smart-cultivation-system",
    title: "Smart Cultivation System",
    period: "Fall 2024",
    status: "Completed",
    desc: "An IoT system that optimizes plant growth with temperature/humidity/light sensors and automatic watering.",
    tags: ["ESP32", "IoT", "React"],
    image: "/projects/smart-cultivation-system.svg",
    detail:
      "A closed-loop growing box that monitors temperature, humidity, and light, then automatically waters and adjusts lighting. A React dashboard shows live readings and history.",
    highlights: [
      "ESP32 firmware with sensor polling",
      "Automatic watering and grow-light control",
      "Live dashboard with charts",
    ],
    team: "IoT team · 4 members",
  },
  {
    slug: "gesture-controlled-robotic-arm",
    title: "Gesture-Controlled Robotic Arm",
    period: "Spring 2024",
    status: "Completed",
    desc: "An interaction project that controls a robotic arm by recognizing hand gestures in real time.",
    tags: ["MediaPipe", "Python", "Arduino"],
    image: "/projects/gesture-controlled-robotic-arm.svg",
    detail:
      "Using a webcam and MediaPipe hand tracking, this project maps finger and wrist movements to a robotic arm in real time, letting you move objects without touching a controller.",
    highlights: [
      "Real-time hand landmark tracking",
      "Gesture-to-motion mapping",
      "Sub-100ms control latency",
    ],
    team: "Vision team · 3 members",
  },
  {
    slug: "fpv-racing-drone",
    title: "FPV Racing Drone",
    period: "Summer 2025",
    status: "In progress",
    desc: "A racing drone built with a self-designed, self-assembled frame and custom firmware.",
    tags: ["Betaflight", "PCB Design", "3D Printing"],
    image: "/projects/fpv-racing-drone.svg",
    detail:
      "A 5-inch FPV racing quad designed from the frame up. We're tuning a custom Betaflight configuration and iterating on a 3D-printed frame for durability and weight.",
    highlights: [
      "Self-designed 3D-printed frame",
      "Custom Betaflight tune",
      "Low-latency analog FPV feed",
    ],
    team: "Flight team · 5 members",
  },
];

// ------------------------------------------------------------
//  Events & competitions
//  - slug:  unique id used for the detail page URL (/events/<slug>)
//  - image: path to a photo in the /public folder (replace with your own)
//  - detail: longer recap shown on the detail page
//  - gallery: list of image paths shown on the detail page
// ------------------------------------------------------------
export const events = [
  {
    slug: "national-university-robot-competition",
    name: "National University Robot Competition",
    year: "2024",
    result: "Finalist · Special Award",
    place: "COEX",
    image: "/events/national-university-robot-competition.svg",
    detail:
      "Two of our teams reached the finals of the national robot competition. One picked up a special award for its innovative gripper design after three intense days of qualifiers.",
    gallery: [
      "/events/national-university-robot-competition.svg",
      "/events/national-university-robot-competition-2.svg",
    ],
  },
  {
    slug: "maker-faire-seoul",
    name: "Maker Faire Seoul",
    year: "2024",
    result: "Booth exhibitor",
    place: "Oil Tank Culture Park",
    image: "/events/maker-faire-seoul.svg",
    detail:
      "We ran a hands-on booth showing off member projects and let visitors try our gesture-controlled arm. A great weekend of sharing what we build with the public.",
    gallery: [
      "/events/maker-faire-seoul.svg",
      "/events/maker-faire-seoul-2.svg",
    ],
  },
  {
    slug: "embedded-sw-competition",
    name: "Embedded SW Competition",
    year: "2023",
    result: "Bronze Award",
    place: "Online",
    image: "/events/embedded-sw-competition.svg",
    detail:
      "Our embedded team took home a bronze award in this online competition with a low-power sensor node design that impressed the judges on efficiency.",
    gallery: ["/events/embedded-sw-competition.svg"],
  },
  {
    slug: "campus-hackathon",
    name: "Campus Hackathon",
    year: "2025",
    result: "Grand Prize · Popularity Award",
    place: "Engineering Hall",
    image: "/events/campus-hackathon.svg",
    detail:
      "A 24-hour build sprint where members split into teams and shipped working prototypes overnight. We swept both the grand prize and the popularity vote.",
    gallery: [
      "/events/campus-hackathon.svg",
      "/events/campus-hackathon-2.svg",
    ],
  },
];

// ------------------------------------------------------------
//  Schedule — upcoming activities
// ------------------------------------------------------------
export const schedule = [
  { date: "03.14", title: "New Member Orientation", tag: "Recruiting" },
  { date: "03.28", title: "Arduino Basics Workshop", tag: "Seminar" },
  { date: "04.12", title: "Project Team Building Day", tag: "Project" },
  { date: "05.09", title: "Midterm Showcase & Demo", tag: "Showcase" },
  { date: "06.20", title: "Summer Competition Bootcamp", tag: "Competition" },
];

// ------------------------------------------------------------
//  Contact & join
// ------------------------------------------------------------
export const contact = {
  email: "mero.club@example.com",
  location: "Club Room 302, 3rd Floor, Engineering Hall",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};
