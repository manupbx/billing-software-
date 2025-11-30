# billing-software-
A lightweight, fully offline Billing and Invoice Management system built with HTML, CSS, and Vanilla JavaScript. Features local data persistence, revenue analytics, and printable invoices.
 # 🧾 Professional Billing & Invoicing Software

A feature-rich, **Single Page Application (SPA)** designed to handle billing and invoicing tasks efficiently. This project is built entirely with frontend technologies and operates **100% offline** using the browser's LocalStorage for data persistence.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Key Features

* **📝 Invoice Generation:** Create detailed invoices with client information, itemized lists, and custom tax rates.
* **💾 Local Data Persistence:** Uses the **Web Storage API (LocalStorage)** to save all invoices directly in the browser. No database connection required.
* **📊 Analytics Dashboard:** Visualizes revenue trends, tracks paid vs. pending invoices, and identifies top clients.
* **🖨️ Print-Ready:** Custom CSS (`@media print`) ensures invoices look professional when printed or saved as PDF.
* **⚡ Instant Calculations:** Real-time calculation of subtotals, taxes, and grand totals using JavaScript.
* **🌗 Modern UI:** A dark-themed, responsive interface designed with CSS Grid and Flexbox.

## 🛠️ Tech Stack

* **HTML5:** Semantic structure.
* **CSS3:** Custom styling + Tailwind CSS (via CDN) for responsive design.
* **JavaScript (ES6+):** Core logic, DOM manipulation, and data handling.
* **LocalStorage:** Client-side "database" for storing invoice history.

## 📂 Project Structure

```text
BillingProject/
├── index.html      # The main structure of the application
├── style.css       # Custom styling and print layouts
└── script.js       # Logic for calculations, storage, and UI updates
