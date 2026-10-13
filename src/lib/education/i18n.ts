import type { Locale } from "../i18n";
import { controlPath, developmentSetupPath, localizationPath, reinforcementLearningPath, robotVisionPath, rosPath } from "./catalog";
import { deepMLPath } from "./deepml-catalog";
import { simulationPath } from "./simulation-catalog";

// English names for the education shell. Lesson bodies stay Korean for now; only topic and route chrome is translated.
const topicsEn: Record<string, { title: string; description: string }> = {
  [developmentSetupPath]: { title: "Development Setup", description: "Start with the role of the robot's computer, learn the terminal, processes, data and networking, then move on to CPUs, GPUs, containers and remote work." },
  [controlPath]: { title: "Control", description: "Learn feedback response and joint PD control, then connect trajectories, contact and actuator limits to how a robot moves." },
  [rosPath]: { title: "ROS", description: "Learn nodes, topics, services and actions, then coordinate frames, time, QoS and launch structure. The hands-on labs target ROS 2 Humble; the concept material also follows the latest official docs." },
  [deepMLPath]: { title: "DeepML · Learning Foundations", description: "Starting from images and sensor data, learn how neural networks are trained and evaluated, representation learning, Transformers, and multimodal and generative models. The focus is on inputs, outputs and robot examples rather than equations." },
  [localizationPath]: { title: "Localization", description: "Find out where the robot is by comparing what its sensors measure with a map." },
  [simulationPath]: { title: "Robotics & Simulation", description: "Model a robot's body and joints, and connect MuJoCo's physics to a reinforcement learning environment. MuJoCo is the main tool; students who need ROS integration can take the Gazebo introduction." },
  [reinforcementLearningPath]: { title: "Reinforcement Learning", description: "Go from the basics of observations, actions, policies and rewards to controlling a robot with a trained policy. Kimodo and Microban are applied materials that build on these ideas." },
  [robotVisionPath]: { title: "Robot Vision", description: "Go from cameras and object recognition to depth, learning from demonstrations and VLA, reading at your level from finding objects to choosing robot actions from images and language." },
};

const routesEn: Record<string, { title: string; description: string }> = {
  "공통 입문": { title: "Common Foundations", description: "Education is where you learn the concepts before joining a project task. Read about the roles in a robot program, units, coordinates and time, arrays and feedback. Local setup is only for students who need it." },
  "휴머노이드 동작 이해": { title: "Understanding Humanoid Motion", description: "Dancing needs motion and contact over time; crawling needs the allowed contacts of several body parts and body height. Learn what the motion means here; the actual policies and obstacle tasks are built in the project." },
  "사족 지형·점프 이해": { title: "Understanding Quadruped Terrain & Jumping", description: "Uses the same feedback and reinforcement learning basics. Prepare to see why observations and evaluation differ for stance and swing, stepping on stairs, and take-off, flight and landing. Building walking and jumping policies is part of the project." },
  "로봇 비전 · 조작 · VLA 이해": { title: "Understanding Robot Vision, Manipulation & VLA", description: "You don't need to finish the ROS motor labs or the synthetic data project. After learning inputs, training and evaluation, connect vision, language and action. RB-Y1 hardware setup and demo collection are decided in the project." },
  "ROS · Gazebo 선택 과정": { title: "ROS · Gazebo (Optional)", description: "Only for students who will connect ROS and a simulator in their project. It separates the roles of communication, physics, rendering and sensors, and does not replace a full robot integration project." },
};

export function localizeTopic<T extends { path: string; title: string; description: string }>(topic: T, locale: Locale): T {
  const copy = locale === "en" ? topicsEn[topic.path] : undefined;
  return copy ? { ...topic, ...copy } : topic;
}
export function localizeRoute<T extends { title: string; description: string }>(route: T, locale: Locale): T {
  const copy = locale === "en" ? routesEn[route.title] : undefined;
  return copy ? { ...route, ...copy } : route;
}
export const levelLabel = (level: string | undefined, locale: Locale) => locale === "en" ? ({ 입문: "Intro", 기초: "Foundations", 응용: "Applied" } as Record<string, string>)[level || ""] ?? level : level;
