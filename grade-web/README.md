# 🎓 GradeSystem — Student Grade Tracker

<div align="center">

![GradeSystem Banner](https://img.shields.io/badge/GradeSystem-Student%20Grade%20Tracker-6c63ff?style=for-the-badge&logo=graduation-cap&logoColor=white)

[![Java](https://img.shields.io/badge/Java-17%2B-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A complete, full-featured Student Grade Tracker built in two forms:**
- 🖥️ **Console Application** — Java CLI with ArrayList storage
- 🌐 **Web Application** — Modern dark-themed site on localhost with PDF export

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Grade Scale](#grade-scale)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Console App (Java)](#console-app-java)
  - [Web App (Localhost)](#web-app-localhost)
- [Web App Screenshots](#web-app-screenshots)
- [PDF Report Export](#pdf-report-export)
- [Tech Stack](#tech-stack)
- [Test Results](#test-results)
- [License](#license)

---

## 🌟 Overview

**GradeSystem** is a full-featured student grade management application. It was built to fulfil the following core requirements:

| Requirement | Status |
|-------------|--------|
| Input and manage student grades | ✅ Done |
| Calculate average, highest, and lowest scores | ✅ Done |
| Use ArrayList to store and manage student data | ✅ Done |
| Display a summary report of all students | ✅ Done |
| Provide a console-based interface | ✅ Done |
| Provide a web-based interface (bonus) | ✅ Done |
| Export PDF report (bonus) | ✅ Done |

---

## ✨ Features

### 🖥️ Console App Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Add Student** | Enter Student ID, name, score — fully validated |
| 2 | **View All Students** | Formatted ASCII table with ID, name, score, grade |
| 3 | **Calculate Average** | Average of all scores to 2 decimal places |
| 4 | **Find Highest Score** | Shows highest score + all tied students |
| 5 | **Find Lowest Score** | Shows lowest score + all tied students |
| 6 | **Summary Report** | Total students, all records, stats, grade distribution |
| 7 | **Search by ID** | Find a student instantly by their ID |
| 8 | **Update Grade** | Update an existing student's score (validated) |
| 9 | **Delete Student** | Remove a student by ID; stats update automatically |
| 10 | **Exit** | Clean exit with goodbye message |

### 🌐 Web App Features

- **Dashboard** — Live stat cards, animated grade distribution bars, recent students
- **Add Student** — Live validation with styled error/success alerts
- **All Students** — Searchable, filterable table with Edit & Delete actions
- **Search** — Instant student lookup by ID
- **Summary Report** — Full stats + student table + grade distribution
- **PDF Export** — Styled dark-themed PDF report downloaded instantly

### 🔒 Input Validation (Both Apps)

- Student ID must be non-empty and **unique**
- Student name must be **non-empty**
- Score must be **numeric**, between **0 and 100** (decimals like `87.5` supported)
- Invalid input is **rejected** and the user is prompted again
- Empty list edge cases handled — no division by zero, no crashes

---

## 📊 Grade Scale

| Score Range | Grade | Colour |
|-------------|-------|--------|
| 90 – 100 | **A+** | 🟣 Purple |
| 80 – 89.99 | **A** | 🔵 Blue |
| 70 – 79.99 | **B** | 🟢 Green |
| 60 – 69.99 | **C** | 🟡 Yellow |
| 50 – 59.99 | **D** | 🟠 Orange |
| 0 – 49.99 | **F** | 🔴 Red |

> Example: A score of `89.5` → Grade **A** | A score of `49.5` → Grade **F**

---

## 📁 Project Structure

```
GRADE/
│
├── 📂 StudentGradeTracker/          ← Java Console App
│   ├── Student.java                  Student model (fields, getters, grade calc)
│   └── StudentGradeTracker.java      Main app (menu, ArrayList, all features)
│
├── 📂 grade-web/                    ← Web App (localhost)
│   ├── index.html                    Main HTML page (sidebar + 5 sections)
│   ├── style.css                     Dark glassmorphism design system
│   ├── app.js                        All JS logic + PDF export (jsPDF)
│   ├── SimpleServer.java             Java HTTP server (no Node required!)
│   └── START.bat                     One-click Windows launcher for web app
│
├── ⚡ RUN_CONSOLE.bat                One-click launcher for Java Console App
├── ⚡ START_WEB.bat                  One-click launcher for Web App
├── 📜 LICENSE                        MIT License
├── 🙈 .gitignore                     Git ignore for compiled classes and OS files
└── 📖 README.md                      Project documentation with full details
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** installed ([Download Temurin](https://adoptium.net/))
- A modern web browser (Chrome, Edge, Firefox)
- Git (to clone this repo)

### Clone the Repository

```bash
git clone https://github.com/HAMEED-IBRAHIM/GRADE.git
cd GRADE
```

---

### Console App (Java)

Navigate to the console app folder:

```bash
cd StudentGradeTracker
```

**Compile:**
```bash
javac Student.java StudentGradeTracker.java
```

**Run:**
```bash
java StudentGradeTracker
```

**You will see the menu:**
```
========================================
        STUDENT GRADE TRACKER
========================================
  1. Add Student
  2. View All Students
  3. Calculate Average Score
  4. Find Highest Score
  5. Find Lowest Score
  6. Generate Summary Report
  7. Search Student by ID
  8. Update Student Grade
  9. Delete Student
 10. Exit
========================================
Enter your choice:
```

Type a number and press **Enter** to use each feature.

---

### Web App (Localhost)

Navigate to the web app folder:

```bash
cd grade-web
```

#### Option A — One-Click (Windows)

Double-click **`START.bat`**

It will:
1. Compile `SimpleServer.java`
2. Open your browser at `http://localhost:3000`
3. Start the server

#### Option B — Terminal

```bash
# Compile the server (only needed once)
javac SimpleServer.java

# Start the server
java SimpleServer
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Option C — Python (if installed)

```bash
python -m http.server 3000
```

Then open **[http://localhost:3000](http://localhost:3000)**

---

## 🖼️ Web App Screenshots

### Dashboard
> Live statistics, grade distribution bars, recent students

### All Students
> Searchable table with filter by grade, Edit and Delete actions per row

### Summary Report + PDF Export
> Complete report with all statistics and one-click PDF download

---

## 📄 PDF Report Export

Click **"Export PDF Report"** in the sidebar (web app).

The PDF includes:
- 📊 **Statistics** — total students, average, highest, lowest
- 📋 **Student Table** — ID, name, score, grade for every student
- 📈 **Grade Distribution** — count per grade category
- 🗓️ **Timestamp** — date and time of export

The file is auto-named: `Grade_Report_YYYY-MM-DD.pdf`

---

## 🛠️ Tech Stack

### Console App
| Technology | Purpose |
|------------|---------|
| Java 17 | Language |
| `ArrayList<Student>` | In-memory data store |
| `Scanner` | Console input |
| OOP | `Student` model class |

### Web App
| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| Vanilla CSS | Dark glassmorphism design |
| Vanilla JavaScript | All app logic (no framework) |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation (CDN) |
| [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Table in PDF (CDN) |
| Java `com.sun.net.httpserver` | Built-in HTTP server |
| Google Fonts — Inter | Typography |

---

## ✅ Test Results

All **25 mandatory test cases** passed:

| # | Test Case | Result |
|---|-----------|--------|
| 1 | Add a valid student | ✅ Pass |
| 2 | Add multiple students | ✅ Pass |
| 3 | Duplicate student ID rejected | ✅ Pass |
| 4 | Empty student name rejected | ✅ Pass |
| 5 | Negative score rejected | ✅ Pass |
| 6 | Score > 100 rejected | ✅ Pass |
| 7 | Non-numeric score rejected | ✅ Pass |
| 8 | Decimal scores accepted (87.5, 49.5) | ✅ Pass |
| 9 | View all students in table | ✅ Pass |
| 10 | Average = 80.00 for (90+80+70)/3 | ✅ Pass |
| 11 | Highest score identified correctly | ✅ Pass |
| 12 | Lowest score identified correctly | ✅ Pass |
| 13 | Ties handled — all tied students shown | ✅ Pass |
| 14 | Summary report generated | ✅ Pass |
| 15 | Search existing student | ✅ Pass |
| 16 | Search non-existent ID — clear message | ✅ Pass |
| 17 | Update student score | ✅ Pass |
| 18 | Stats update after score change | ✅ Pass |
| 19 | Delete existing student | ✅ Pass |
| 20 | Delete non-existent ID — error shown | ✅ Pass |
| 21 | Stats update after deletion | ✅ Pass |
| 22 | Report on empty list — friendly message | ✅ Pass |
| 23 | Stats on empty list — no crash | ✅ Pass |
| 24 | Invalid menu option handled gracefully | ✅ Pass |
| 25 | Exit cleanly | ✅ Pass |

### Sample Calculation Verification

| Input | Expected | Actual |
|-------|----------|--------|
| Arun — 90 | Grade A+ | ✅ A+ |
| Priya — 80 | Grade A | ✅ A |
| Rahul — 70 | Grade B | ✅ B |
| Average | 80.00 | ✅ 80.00 |
| Highest | 90 (Arun) | ✅ Correct |
| Lowest | 70 (Rahul) | ✅ Correct |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using Java + Vanilla Web Tech

⭐ Star this repo if you found it useful!

</div>
