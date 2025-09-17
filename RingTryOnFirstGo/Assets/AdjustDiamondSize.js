//@input Component.RenderMeshVisual[] diamonds
//@input Component.ScriptComponent colorPickerScript
//@input Component.Text caratText {"label":"Carat Screen Text (optional)"}
//@input float minCarat = 0.25 {"widget":"slider","min":0.05,"max":5.0,"step":0.01}
//@input float maxCarat = 3.00 {"widget":"slider","min":0.05,"max":10.0,"step":0.01}

// Configurable scale range (feel free to adjust)
var MIN_SCALE = 0.5;
var MAX_SCALE = 1.25;

var originalLocalScales = [];
var diamondsSceneObjects = [];
var lastAppliedNorm = -1;

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

function applyScaleFromNorm(norm) {
    if (originalLocalScales.length === 0 || diamondsSceneObjects.length === 0) {
        return;
    }

    norm = clamp01(norm);
    if (norm === lastAppliedNorm) {
        return; // avoid redundant work
    }
    lastAppliedNorm = norm;

    var minS = MIN_SCALE;
    var maxS = MAX_SCALE;
    if (maxS < minS) { var tmp = maxS; maxS = minS; minS = tmp; }

    var scaleFactor = minS + (maxS - minS) * norm;

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
    var norm = readSlider();
    applyScaleFromNorm(norm);
    updateCaratText(norm);
}

initializeOriginalScales();

// Update on color changes (fires when slider moves)
if (script.colorPickerScript && script.colorPickerScript.onColorChanged) {
    script.colorPickerScript.onColorChanged.add(updateFromPicker);
}

// Apply once on start
updateFromPicker();


function updateCaratText(norm) {
    if (!script.caratText) { return; }
    norm = clamp01(norm);
    var minC = script.minCarat;
    var maxC = script.maxCarat;
    if (maxC < minC) { var tmp = maxC; maxC = minC; minC = tmp; }
    var carat = minC + (maxC - minC) * norm;
    var text = "~" + carat.toFixed(1) + " carat";
    script.caratText.text = text;
}

