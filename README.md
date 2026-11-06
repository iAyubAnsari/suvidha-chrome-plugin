# Suvidha Booking Assistant

A Manifest V3 Google Chrome extension designed for exporters using the West Bengal Government's **Suvidha Vehicles Facilitation System** (`suvidha-mp.wb.gov.in`).

---

## Features

### 1. Stage 1: Slot & Calendar Automation (`/exporter-oth/avilable-slot`)
- **Type of Goods Selection**: Automatically selects `NON-PERISHABLE` (or priority goods).
- **Vehicle Category Selection**: Waits for AJAX to populate categories and selects the specified vehicle type (e.g. `OTHERS - NON PERISHABLE UP TO 06 WHEELERS`).
- **Calendar Slot Booking**:
  - Automatically identifies available slots on the calendar (`.slot_available`).
  - Matches by specific date (e.g. `11/08/2026`) or defaults to the first available date with slots.
  - Submits the form natively to navigate directly to the booking form.

### 2. Stage 2: Booking Form Autofill & Calculation (`/exporter-oth/slot-booking`)
- **Exporter Details Autofill**:
  - Name of the goods
  - UDIN of LC (up to 25 characters)
  - LC Number
  - LC Date (formatted to `mm/dd/yyyy`)
  - Name of the Importer
  - Total number of Vehicles
- **Reactive Framework Compatibility**: Uses prototype property descriptor setters to trigger `input` and `change` event bubbling.
- **Auto-Calculate**: Clicks the green "Calculate" button automatically.
- **Instant Focus on CAPTCHA**: Immediately places keyboard focus into the CAPTCHA field so the user can quickly type the code.
- **Real-Time Error Notice**: Uses a lightweight DOM observer to alert the user if CAPTCHA verification fails.

---

## Installation

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select this directory (`suvidha-chrome-plugin`).
4. Pin the **Suvidha Booking Assistant** extension to your toolbar.

---

## Usage

1. Click the extension icon in Chrome to open the popup.
2. Enter your exporter profile:
   - **Type of Goods** & **Vehicle Category**
   - **Target Slot Date** or **LC Date**
   - **Goods Name**, **UDIN**, **LC Number**, **Importer Name**, and **Vehicle Count**
3. Ensure both toggles are checked:
   - *Auto-click '+' slot on calendar*
   - *Auto-click Calculate button*
   - *Auto-fill immediately when page loads*
4. Click **Save Profile**.
5. Log in to the Suvidha portal and open `https://suvidha-mp.wb.gov.in/exporter-oth/avilable-slot`.
6. The assistant will handle slot selection, calendar booking, form filling, and fee calculation.
7. Type the CAPTCHA code and click **Proceed to payment**.

