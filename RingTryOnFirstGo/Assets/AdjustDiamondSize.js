//@input Component.RenderMeshVisual[] diamonds
//@input Component.ScriptComponent colorPickerScript
//@input Component.Text caratText {"label":"Carat Screen Text (optional)"}
//@input float minCarat = 0.25 {"widget":"slider","min":0.05,"max":5.0,"step":0.01}
//@input float maxCarat = 3.00 {"widget":"slider","min":0.05,"max":10.0,"step":0.01}
//@input float baselineCarat = 1.00 {"widget":"slider","min":0.05,"max":10.0,"step":0.01,"label":"Baseline Carat (model default)"}

// Legacy linear scale range (kept for fallback if needed)
var MIN_SCALE = 0.5;
var MAX_SCALE = 1.25;

var originalLocalScales = [];
var diamondsSceneObjects = [];
var lastAppliedScale = -1;

function initializeOriginalScales() {
    originalLocalScales = [];
    diamondsSceneObjects = [];

    if (!script.diamonds || script.diamonds.length === 0) {
        return;
    }

    for (var i = 0; i < script.diamonds.length; i++) {
        var rmv = script.diamonds[i];
        if (!rmv) { continue; }
        var so = rmv.getSceneObject();
        if (!so) { continue; }
        diamondsSceneObjects.push(so);
        var t = so.getTransform();
        originalLocalScales.push(t.getLocalScale());
    }
}

function clamp01(v) {
    return Math.max(0.0, Math.min(1.0, v));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Approximate round brilliant diameter (mm) by carat using a lookup and linear interpolation
// Sources vary; these are reasonable typical averages.
var CARAT_TO_MM_TABLE = CARAT_TO_MM_TABLE || [
    { c: 0.25, mm: 4.1 },
    { c: 0.33, mm: 4.4 },
    { c: 0.50, mm: 5.2 },
    { c: 0.75, mm: 5.8 },
    { c: 1.00, mm: 6.5 },
    { c: 1.25, mm: 6.9 },
    { c: 1.50, mm: 7.4 },
    { c: 2.00, mm: 8.2 },
    { c: 3.00, mm: 9.4 },
    { c: 4.00, mm: 10.3 },
    { c: 5.00, mm: 11.1 }
];

function caratToDiameterMm(carat) {
    if (!CARAT_TO_MM_TABLE || CARAT_TO_MM_TABLE.length === 0) {
        return 6.5; // safe default ~1ct
    }
    if (carat <= CARAT_TO_MM_TABLE[0].c) {
        return CARAT_TO_MM_TABLE[0].mm;
    }
    for (var i = 0; i < CARAT_TO_MM_TABLE.length - 1; i++) {
        var a = CARAT_TO_MM_TABLE[i];
        var b = CARAT_TO_MM_TABLE[i + 1];
        if (carat >= a.c && carat <= b.c) {
            var t = (carat - a.c) / (b.c - a.c);
            return lerp(a.mm, b.mm, t);
        }
    }
    return CARAT_TO_MM_TABLE[CARAT_TO_MM_TABLE.length - 1].mm;
}

function computeScaleFromCarat(targetCarat, baselineCarat) {
    if (!baselineCarat || baselineCarat <= 0) { baselineCarat = 1.0; }
    var targetMm = caratToDiameterMm(targetCarat);
    var baseMm = caratToDiameterMm(baselineCarat);
    var ratio = targetMm / baseMm;
    var minS = MIN_SCALE;
    var maxS = MAX_SCALE;
    if (maxS < minS) { var tmp = maxS; maxS = minS; minS = tmp; }
    if (ratio < minS) { ratio = minS; }
    if (ratio > maxS) { ratio = maxS; }
    return ratio;
}

function applyUniformScale(scaleFactor) {
    if (originalLocalScales.length === 0 || diamondsSceneObjects.length === 0) {
        return;
    }

    if (scaleFactor === lastAppliedScale) {
        return; // avoid redundant work
    }
    lastAppliedScale = scaleFactor;

    for (var i = 0; i < diamondsSceneObjects.length; i++) {
        var so = diamondsSceneObjects[i];
        if (!so) { continue; }
        var t = so.getTransform();
        var base = originalLocalScales[i];
        if (!t || !base) { continue; }
        t.setLocalScale(new vec3(base.x * scaleFactor, base.y * scaleFactor, base.z * scaleFactor));
    }
}

function readSlider() {
    var v = 0.5;
    var cps = script.colorPickerScript;
    if (cps && typeof cps.getSliderValue === "function") {
        v = cps.getSliderValue();
    } else if (cps && cps.api && typeof cps.api.getSliderValue === "function") {
        v = cps.api.getSliderValue();
    }
    return v;
}

function updateFromPicker() {
    var norm = clamp01(readSlider());
    var carat = lerp(script.minCarat, script.maxCarat, norm);
    var scaleFromCarat = computeScaleFromCarat(carat, script.baselineCarat);
    applyUniformScale(scaleFromCarat);
    updateCaratTextWithCarat(carat);
}

initializeOriginalScales();

// Update on color changes (fires when slider moves)
if (script.colorPickerScript && script.colorPickerScript.onColorChanged) {
    script.colorPickerScript.onColorChanged.add(updateFromPicker);
}

// Apply once on start
updateFromPicker();


function updateCaratTextWithCarat(carat) {
    if (!script.caratText) { return; }
    var text = "~" + carat.toFixed(1) + " carat";
    script.caratText.text = text;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Approximate round brilliant diameter (mm) by carat using a lookup and linear interpolation
// Sources vary; these are reasonable typical averages.
var CARAT_TO_MM_TABLE = [
    { c: 0.25, mm: 4.0 },
    { c: 0.33, mm: 4.4 },
    { c: 0.50, mm: 5.0 },
    { c: 0.75, mm: 5.75 },
    { c: 1.00, mm: 6.5 },
    { c: 1.25, mm: 6.8 },
    { c: 1.50, mm: 7.3 },
    { c: 2.00, mm: 8.0 },
    { c: 3.00, mm: 9.1 },
    { c: 4.00, mm: 10.25 },
    { c: 5.00, mm: 11.0 }
];

function caratToDiameterMm(carat) {
    if (carat <= CARAT_TO_MM_TABLE[0].c) {
        return CARAT_TO_MM_TABLE[0].mm;
    }
    for (var i = 0; i < CARAT_TO_MM_TABLE.length - 1; i++) {
        var a = CARAT_TO_MM_TABLE[i];
        var b = CARAT_TO_MM_TABLE[i + 1];
        if (carat >= a.c && carat <= b.c) {
            var t = (carat - a.c) / (b.c - a.c);
            return lerp(a.mm, b.mm, t);
        }
    }
    return CARAT_TO_MM_TABLE[CARAT_TO_MM_TABLE.length - 1].mm;
}

function computeScaleFromCarat(targetCarat, baselineCarat) {
    // If baselineCarat equals targetCarat, scale should be 1.0
    if (!baselineCarat || baselineCarat <= 0) { baselineCarat = 1.0; }

    var targetMm = caratToDiameterMm(targetCarat);
    var baseMm = caratToDiameterMm(baselineCarat);

    var ratio = targetMm / baseMm;

    // Optional clamp using legacy min/max as safety rails
    var minS = MIN_SCALE;
    var maxS = MAX_SCALE;
    if (maxS < minS) { var tmp = maxS; maxS = minS; minS = tmp; }
    if (ratio < minS) { ratio = minS; }
    if (ratio > maxS) { ratio = maxS; }
    return ratio;
}

