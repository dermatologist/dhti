I’m organizing slots by **where they appear in the chart**, so you can quickly drop in extensions for DHTI, CDS, AI summaries, or workflow buttons.

---

# 🧩 **Patient Chart – All Extension Slots (O3)**
*(Comprehensive list across esm‑patient‑chart, esm‑patient‑common-lib, and patient‑data apps)*

---

## 📌 **1. Patient Chart Navigation & Dashboards**
These control the left‑hand navigation and dashboard grouping.

### **Navigation**
- `patient-chart-dashboard-slot`
  *(Add nav groups, pages, dashboards)*

### **Summary Dashboard (top-level widgets)**
- `patient-chart-summary-dashboard-slot`
  *(Main summary widgets: conditions, allergies, meds, vitals, programs, etc.)*

### **Dashboard-specific slots**
Each dashboard exposes its own slot:

- `patient-chart-allergies-dashboard-slot`
- `patient-chart-conditions-dashboard-slot`
- `patient-chart-medications-dashboard-slot`
- `patient-chart-vitals-dashboard-slot`
- `patient-chart-programs-dashboard-slot`
- `patient-chart-lab-results-dashboard-slot`
- `patient-chart-immunizations-dashboard-slot`
- `patient-chart-notes-dashboard-slot`
- `patient-chart-encounters-dashboard-slot`
- `patient-chart-appointments-dashboard-slot`
- `patient-chart-flags-dashboard-slot`
- `patient-chart-diagnoses-dashboard-slot`
- `patient-chart-orders-dashboard-slot`

*(Some dashboards appear only if the corresponding ESM is installed.)*

---

## 📌 **2. Patient Banner & Header**
These appear at the top of every chart page.

- `patient-banner-slot`
- `patient-banner-actions-slot`
- `patient-header-slot`
- `patient-header-actions-slot`

---

## 📌 **3. Patient Summary Widgets (individual apps)**
Each patient‑data widget exposes its own extension points.

### **Allergies**
- `patient-allergies-summary-slot`
- `patient-allergies-overview-slot`
- `patient-allergies-table-row-slot`
- `patient-allergies-form-slot`

### **Conditions**
- `patient-conditions-summary-slot`
- `patient-conditions-overview-slot`
- `patient-conditions-table-row-slot`
- `patient-conditions-table-actions-slot`
- `patient-conditions-empty-state-slot`
- `condition-form-top-slot`
- `condition-form-fields-slot`
- `condition-form-bottom-slot`

### **Medications**
- `patient-medications-summary-slot`
- `patient-medications-overview-slot`
- `patient-medications-table-row-slot`
- `patient-medications-form-slot`

### **Vitals & Biometrics**
- `patient-vitals-summary-slot`
- `patient-vitals-overview-slot`
- `patient-vitals-form-slot`

### **Programs**
- `patient-programs-summary-slot`
- `patient-programs-overview-slot`
- `patient-programs-enrollment-form-slot`

### **Immunizations**
- `patient-immunizations-summary-slot`
- `patient-immunizations-overview-slot`
- `patient-immunizations-form-slot`

### **Lab Results**
- `patient-lab-results-summary-slot`
- `patient-lab-results-overview-slot`

### **Clinical Notes**
- `patient-notes-summary-slot`
- `patient-notes-overview-slot`
- `patient-notes-form-slot`

### **Encounters**
- `patient-encounters-summary-slot`
- `patient-encounters-overview-slot`
- `patient-encounters-table-row-slot`

---

## 📌 **4. Visit & Encounter Workflow Slots**
These appear in visit pages and encounter forms.

- `visit-actions-slot`
- `visit-details-slot`
- `encounter-form-top-slot`
- `encounter-form-fields-slot`
- `encounter-form-bottom-slot`

---

## 📌 **5. Global Patient Chart Utility Slots**
These are used by flags, alerts, CDS, AI summaries, etc.

- `patient-alerts-slot`
- `patient-flags-slot`
- `patient-actions-slot`
- `patient-sidebar-slot`
- `patient-chart-widget-slot`
  *(Generic slot for any widget)*

