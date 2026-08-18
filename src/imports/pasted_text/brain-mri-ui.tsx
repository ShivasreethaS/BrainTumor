Create a **modern, clean, single-page web application UI for an AI-powered Brain MRI Tumor Classification System**.

### Purpose

The application allows a user to upload a brain MRI image. An AI model classifies the image into one of four classes:

1. **Glioma Tumor**
2. **Meningioma Tumor**
3. **Pituitary Tumor**
4. **No Tumor — Healthy Brain MRI**

The application also includes **Explainable AI (XAI)** visualization using a heatmap to show which regions of the MRI influenced the model's prediction.

### Overall Design

* Single-page application
* Professional **medical AI / healthcare** aesthetic
* Clean, minimal, trustworthy interface
* White/light background with subtle blue or teal accents
* Rounded cards and buttons
* Clear visual hierarchy
* Responsive desktop and tablet layout
* Avoid excessive animations or decorative elements
* Make the interface look like a real medical AI research prototype rather than a generic website

### Header

Create a compact header containing:

**BrainScan AI**

Subtitle:
**AI-Powered Brain Tumor Classification & Explainable Analysis**

Navigation on the right:

* Home
* About Model
* XAI

Add a small status indicator:
**● AI Model Ready**

### Main Upload Section

The main focus of the page should be a large centered card titled:

**Upload Brain MRI**

Supporting text:

**Upload a brain MRI image to classify the scan using our AI model.**

Create a large drag-and-drop upload area with:

* MRI/brain icon
* Text: **Drag & Drop your MRI image here**
* Text: **or**
* Primary button: **Browse Image**
* Supported formats: **JPG, JPEG, PNG**
* Maximum file size: **10 MB**

After uploading, show:

* MRI image preview
* File name
* File size
* Remove button
* **Analyze MRI** primary button

### Prediction Result Section

Initially keep this section hidden or show it as an empty state.

After clicking **Analyze MRI**, display a results card titled:

**AI Prediction**

Show a large prediction badge such as:

**Glioma Tumor**

Below it show:

**Confidence: 96.8%**

Also display a confidence/probability visualization for all four classes:

* Glioma Tumor — 96.8%
* Meningioma Tumor — 1.7%
* Pituitary Tumor — 0.9%
* No Tumor — 0.6%

Use a clean horizontal probability bar or compact chart.

Clearly distinguish the predicted class from the other classes.

### XAI / Explainability Section

Below the prediction result, create a section titled:

**Explainable AI — Attention Heatmap**

Supporting text:

**The heatmap highlights the regions of the MRI that contributed most strongly to the AI prediction.**

Display two images side-by-side:

**Original MRI**

* Uploaded MRI image

**XAI Heatmap**

* MRI with a Grad-CAM-style heatmap overlay

Add a small legend:

**Low Importance → High Importance**

Use a subtle heatmap gradient visualization.

Add an information box:

**How to interpret this**
The highlighted regions represent areas that had greater influence on the model's prediction. This visualization is provided for model interpretability and should not be considered a medical diagnosis.

### Result Summary

Create a compact card titled:

**Analysis Summary**

Show:

* Predicted Class
* Confidence Score
* Model Used
* Analysis Status
* Date/Time

Example:

**Prediction:** Glioma Tumor
**Confidence:** 96.8%
**Model:** Brain MRI Classification CNN
**Status:** Analysis Complete

### Download Results

Create a prominent section titled:

**Export Analysis**

Buttons:

**Download PDF Report**

**Download DOC Report**

The generated report should conceptually contain:

* Application name
* Uploaded MRI image
* Predicted tumor class
* Confidence score
* Probability for all four classes
* Original MRI
* XAI heatmap
* Short explanation of the prediction
* Model information
* Date/time
* Medical disclaimer

Also add:

**Generate Report**

before the download buttons if appropriate.

### Empty / Initial State

Before an image is uploaded, the page should prominently show the upload interface and a small informational section:

**Supported Classifications**

Four compact cards:

🧠 Glioma Tumor
🧠 Meningioma Tumor
🧠 Pituitary Tumor
✓ No Tumor

### Loading State

When the user clicks **Analyze MRI**, show a professional loading state:

**Analyzing MRI...**

with a subtle animated loader and text:

**AI model is processing the image and generating an explainability map.**

### Error State

If an invalid file is uploaded, display:

**Invalid Image**

**Please upload a valid JPG, JPEG, or PNG brain MRI image.**

### Footer

Add a simple footer:

**BrainScan AI | AI-assisted MRI classification**

and:

**For research and educational purposes only. This system does not replace professional medical diagnosis.**

### Important UI Behavior

Design the page as a realistic working prototype with these states:

1. Initial upload state
2. Image uploaded state
3. AI analyzing/loading state
4. Prediction result state
5. XAI heatmap state
6. Report generation/download state
7. Error state

Use realistic placeholder MRI imagery and heatmap imagery for the prototype.

The **upload area and prediction result should be the visual focus of the page**. Keep everything on one page with smooth scrolling between sections.

Use accessible typography, strong contrast, clear buttons, intuitive icons, and professional healthcare UI conventions.
