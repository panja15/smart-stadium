# 🏟️ Smart Stadium Analytics Command Center

An enterprise-grade, AI-powered stadium management dashboard built for the **Google x Hack2Skill PromptWars Virtual Hackathon**. 

This application directly solves the "Physical Event Experience" problem statement by providing stadium operators with real-time crowd telemetry, predictive wait times, and a natural language AI command interface to seamlessly coordinate foot traffic and dispatch staff during large-scale sporting events.

## ✨ Key Features

* **🌍 Dual-View Visualization Engine:** Toggle instantly between a geographical **Google Maps Satellite Heatmap** and a clean, logical **Schematic Floorplan View**.
* **🤖 Gemini AI Command Center:** A natural language interface powered by the Gemini API. Type commands like *"Dispatch security to the North Stand"* or *"Reroute Pavilion End to Gate B"* to execute state changes and trigger visual UI feedback instantly.
* **⚡ Live Firebase Telemetry:** Smooth, real-time synchronization of stadium zone capacities (Gates, Food Courts, Restrooms, Seating) using Firebase Realtime Database. 
* **🚨 Smart Alerts Rerouting:** An automated rule engine that monitors zone capacities and pushes live alerts (e.g., *"⚠️ Gate C congested. Redirecting foot traffic..."*) when thresholds exceed 75%.
* **🏏 Indian Cricket Localization:** Pre-configured with coordinates and contextual node naming (Pavilion End, VIP Enclosure, etc.) for major Indian cricket venues like M. Chinnaswamy Stadium and Narendra Modi Stadium, complete with live mock IPL match context.

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS (Soft White Enterprise Theme)
* **AI & Logic:** Google Gemini API (Function Calling & Intent Parsing)
* **Mapping:** Google Maps JavaScript API (`@react-google-maps/api`)
* **Realtime Data:** Firebase Realtime Database SDK
* **Deployment:** Containerized via Docker & deployed on Google Cloud Run

## 🏗️ Architecture Note: The "Hidden" Simulation Engine
To guarantee a buttery-smooth evaluation experience and prevent multi-client write collisions, this application separates Read and Write operations:
1. **Public Dashboard (`/`):** Strictly Read-Only. Uses Firebase `onValue` listeners to dynamically render the map and UI.
2. **Simulation Engine (`/admin-sim`):** A hidden, dedicated route containing the `setInterval` simulation logic that calculates fluctuating capacities and pushes them to Firebase. Opening this route in a single background tab acts as the centralized "server" driving the live demo.
