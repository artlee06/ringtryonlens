// UI Color Picker.js
// Version: 5.0
// Event: On Awake
// Description: Choose a color from a color palette and apply it to a Mesh Visual. Can also be configured as slider
//
// ----- USAGE -----
// Attach this script to a Scene Object with a Screen Transform Component.
//
// ----- LOCAL API USAGE -----
// Valid Event Types: "onEnableInteractable", "onDisableInteractable", "onColorChanged", "onValueChanged"
//
// Manually enable interactable
// script.enableInteractable()
//
// Manually disable interactable
// script.disableInteractable()

// Add or remove callback function to onColorChanged event, vec4 color parameter will be passed in to callback
// script.onColorChanged.add(callback)
// script.onColorChanged.remove(callback)

// Add or remove callback function to onValueChanged event, float value parameter will be passed in to callback
// script.onValueChanged.add(callback)
// script.onValueChanged.remove(callback)

// Add or remove callback function to onEnableInteractable event
// script.onEnableInteractable.add(callback)
// script.onEnableInteractable.remove(callback)

// Add or remove callback function to onEnableInteractable event
// script.onDisableInteractable.add(callback)
// script.onDisableInteractable.remove(callback)
//
// True if interactable
// script.isInteractable()
//
// Enable touch events
// script.enableTouchEvents()
//
// Disable touch events
// script.disableTouchEvents()
//
// Get the current color selected on this Color Picker
// script.getColor()
//
// Get the current value (0-1) of this Color Picker's slider
// script.getSliderValue()
//
// Manually set the value (0-1) of this Color Picker's slider
// script.setSliderValue(value)

// Manually set direction
// script.isVertical = value
// -----------------

//@input bool interactable = true
//@input int renderOrderOverride = 0 {"label" : "Render Order"}
//@ui {"widget":"separator"}
//@input Component.MaterialMeshVisual colorRecipient
//@input string colorParameterName = "baseColor"
//@ui {"widget":"separator"}

//@input bool editProperties = false
//@ui {"widget":"group_start", "label":"Properties", "showIf":"editProperties"}
//@input float initialPosition = 0.5 {"widget":"slider", "min": 0.0, "max": 1.0, "step": 0.01, "label":"Initial Position"}
//@input string orientation = vertical {"widget":"combobox", "values":[{"label":"Vertical", "value":"vertical"}, {"label":"Horizontal", "value":"horizontal"}]}
//@ui {"widget":"group_end"}
//@ui {"widget":"separator"}
//@input bool editPalette = false
//@ui {"widget":"group_start", "label":"Palette", "showIf":"editPalette"}
//@input int paletteType = 0 {"widget":"combobox", "values":[{"label":"Full Palette", "value": 0}, {"label":"2-Color Gradient", "value": 1}, {"label":"Slider", "value": 2}]}
//@ui {"widget":"group_start", "label":"Full Palette Properties", "showIf":"paletteType", "showIfValue": 0}
//@input float brightness = 1.0 {"widget":"slider", "min": 0.0, "max": 1.0, "step": 0.01, "label":"Saturation"}
//@input float saturation = 1.0 {"widget":"slider", "min": 0.0, "max": 1.0, "step": 0.01, "label":"Brightness"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"2-Color Properties", "showIf":"paletteType", "showIfValue": 1}
//@input vec4 colorStart = {1.0, 1.0, 1.0, 1.0} {"widget":"color"}
//@input vec4 colorEnd = {0.0, 0.0, 0.0, 1.0} {"widget":"color"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"Slider Properties", "showIf":"paletteType", "showIfValue": 2}
//@input vec4 fillColor = {1.0, 1.0, 1.0, 1.0} {"widget":"color"}
//@input vec4 emptyColor = {0.0, 0.0, 0.0, 0.0} {"widget":"color"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editEventCallbacks = false
//@ui {"widget":"group_start", "label":"Event Callbacks", "showIf":"editEventCallbacks"}
//@input int callbackType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Behavior Script", "value": 1}, {"label":"Behavior Custom Trigger", "value":2}, {"label":"Custom Function", "value":3}]}

//@input Component.ScriptComponent[] onColorChangedBehaviors {"label":"On Color Changed", "showIf":"callbackType", "showIfValue":1}
//@input Component.ScriptComponent[] onValueChangedBehaviors {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":1}

//@input string[] onColorChangedGlobalBehaviors {"label":"On Color Changed", "showIf":"callbackType", "showIfValue":2}
//@input string[] onValueChangedGlobalBehaviors {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":2}

//@input Component.ScriptComponent customFunctionScript {"showIf":"callbackType", "showIfValue":3}
//@input string[] onColorChangedFunctionNames {"label":"On Color Changed", "showIf":"callbackType", "showIfValue":3}
//@input string[] onValueChangedFunctionNames {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editConnections = false {"label" : "Customize"}
//@ui {"widget":"group_start", "label":"Prefabs", "showIf":"editConnections", "hint": "Swap prefabs to customize look"}
//@input Asset.ObjectPrefab cursorPrefab {"hint" : "A prefab of a cursor object, should have an Image component on it"}
//@input Asset.ObjectPrefab palettePrefab {"hint" : "A prefab of a palette object, should have an Image component on it"}
//@ui {"widget":"group_end"}

//@input bool editAdvancedOptions = false
//@ui {"widget":"group_start", "label":"Debug Statements", "showIf":"editAdvancedOptions"}
//@input bool printDebugStatements = false {"label": "Print Info"}
//@input bool printWarningStatements = false {"label": "Print Warnings"}
//@input bool disableTouchEventsInput = false {"label": "Disable Touch"}
//@ui {"widget":"group_end"}

// script modules
var events = require("Modules/EventModule");
var ui = require("Modules/UIWidgetsModule");
var DestructionHelper = require("Modules/DestructionHelper");
var manager = new DestructionHelper(script);

// Event wrappers
var onEnableInteractable = new events.EventWrapper();
var onDisableInteractable = new events.EventWrapper();

var onPaletteTouchStart = new events.EventWrapper();

var onColorChanged = new events.EventWrapper();
var onValueChanged = new events.EventWrapper();

var onTouchStart = new events.EventWrapper();
var onTouchMove = new events.EventWrapper();
var onTouchEnd = new events.EventWrapper();

// Local API
script.enableInteractable = enableInteractable;
script.disableInteractable = disableInteractable;
script.isInteractable = isInteractable;
script.enableTouchEvents = enableTouchEvents;
script.disableTouchEvents = disableTouchEvents;
script.getColor = getColor;
script.getColorVec3 = getColorVec3;
script.getSliderValue = getSliderValue;
script.setSliderValue = setSliderValue;
script.initialized = false;
script.widgetType = ui.WidgetTypes.UIColorPicker;

// touch api for control from parent widget
script.touchStart = touchStart;
script.touchEnd = touchEnd;
script.touchMove = touchMove;

// Touch Event callbacks
script.onTouchStart = onTouchStart;
script.onTouchEnd = onTouchEnd;
script.onTouchMove = onTouchMove;

// Other event wrappers
script.onColorChanged = onColorChanged;
script.onValueChanged = onValueChanged;

script.onEnableInteractable = onEnableInteractable;
script.onDisableInteractable = onDisableInteractable;

script.allowTouchEvents = !script.disableTouchEventsInput;

script.setOwner = setOwner;
script.notifyOnInitialize = notifyOnInitialize;

var isVertical = script.orientation == "vertical";
Object.defineProperty(script, 'isVertical', {
    get: function () { return isVertical; },
    set: function (value) { isVertical = value; initOrientation() }
});


// Is this widget interactable?
var interactable = script.interactable;

// 2D Slider properties
var minValueX = 0.0;
var maxValueX = 1.0;

var stepValueX = 0.001;


var minValueY = 0.0;
var maxValueY = 1.0;
var stepValueY = 0.001;

var initialValueX;
var initialValueY;

var minEndpointX;
var maxEndpointX;
var minEndpointY;
var maxEndpointY;


// Relevant Components

var thisScreenTransform = null;
var paletteScreenTransform = null;
var paletteImage = null;
var cursorImage = null;
var cursorScreenTransform = null;

// Color Picker properties
var paletteMaterial;
var currentColor = new vec4(0.0, 0.0, 0.0, 0.0);
var currentValue = 0;
var localScreenPos = new vec2(0.0, 0.0);
var cursorIsSlideable = false;

var interactionComponent;
var sceneObject = script.getSceneObject();
var refreshHelper = new ui.RefreshHelper(initParams);

function refresh() {
    refreshHelper.requestRefresh();
}
refresh();

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize all parameters
function initParams() {
    if (script.initialized) {
        return;
    }
    if (!initColorPicker() ||
        !initInputCallbacks() ||
        !initPalette() ||
        !initCursor() ||
        !initOrientation() ||
        !initLocalScreenPos() ||
        !initInteractable() ||
        !initRenderOrder()
    ) {
        return;
    }
    ui.answerPoliteCalls(script, "notifyOnInitialize");

    checkOwner();

    initializeTouches();

    script.initialized = true;
}

function seekOwner() {
    ui.findScriptUpwards(sceneObject, "acceptChildWidget", function (scr) {
        return scr.acceptChildWidget(script);
    });
}

function setOwner(ownerScript) {
    script.ownerScript = ownerScript;
    refresh();
}

function checkOwner() {
    if (!script.ownerScript) {
        seekOwner();
    }
    return !!script.ownerScript;
}

/**
 * If this widget is not controled with the panel - create it's own touch events
 */
function initializeTouches() {
    // create touch events for this widget if it doesn't have a parent
    interactionComponent = getOrAddComponent(sceneObject, "InteractionComponent");
    // add both bg and circle 
    interactionComponent.addMeshVisual(paletteImage);
    interactionComponent.addMeshVisual(cursorImage);
    // interactionComponent.isFilteredByDepth = false;

    interactionComponent.onTouchStart.add(touchStart);
    interactionComponent.onTouchMove.add(touchMove);
    interactionComponent.onTouchEnd.add(touchEnd);
}

/**
 * Initialize Color Picker screen transform
 * @returns boolean
 */
function initColorPicker() {
    thisScreenTransform = getOrAddComponent(sceneObject, "ScreenTransform");
    return true;
}

/**
 * Initializes min amd max cursor positions based on the color picker orientation
 * @returns boolean
 */
function initOrientation() {
    initialValueX = isVertical ? 0.5 : script.initialPosition;
    initialValueY = isVertical ? script.initialPosition : 0.5;

    minEndpointX = isVertical ? 0.5 : 0.0;
    maxEndpointX = isVertical ? 0.5 : 1.0;
    minEndpointY = isVertical ? 0.0 : 0.5;
    maxEndpointY = isVertical ? 1.0 : 0.5;

    paletteMaterial.mainPass.isVertical = isVertical;
    return true;
}


// Initialize Palette parameters
function initPalette() {
    script.paletteObject = findOrInstantiate(sceneObject, "Palette", script.palettePrefab);
    // Obtain Screen Transform Component from the palette
    paletteScreenTransform = getOrAddComponent(script.paletteObject, "Component.ScreenTransform");
    // Obtain Image Component from the palette
    paletteImage = script.paletteObject.getComponent("Component.Image");
    if (!paletteImage) {
        printWarning("missing an Image Component!");
        return false;
    }

    // Configure palette material
    if (!paletteMaterial) {
        paletteMaterial = paletteImage.mainMaterial.clone();
        paletteImage.mainMaterial = paletteMaterial;

        paletteMaterial.mainPass.paletteType = script.paletteType;


        switch (script.paletteType) {
            case (0):
                paletteMaterial.mainPass.saturation = script.saturation;
                paletteMaterial.mainPass.brightness = script.brightness;
                break;
            case (1):
                paletteMaterial.mainPass.colorStart = script.colorStart;
                paletteMaterial.mainPass.colorEnd = script.colorEnd;
                break;
            case (2):
                paletteMaterial.mainPass.colorStart = script.fillColor;
                paletteMaterial.mainPass.colorEnd = script.emptyColor;
                break;
        }
    }
    return true;
}

/**
 * Initialize cursor
 * @returns boolean
 */

function initCursor() {
    if (!script.cursorObject) {
        script.cursorObject = findOrInstantiate(sceneObject, "Cursor", script.cursorPrefab);
    }
    cursorImage = script.cursorObject.getComponent("Component.Image");
    if (!cursorImage) {
        printWarning("assigned a Cursor Scene Object that is missing an Image Component!");
        return false;
    }
    // Obtain Screen Transform Component from cursor
    cursorScreenTransform = getOrAddComponent(script.cursorObject, "ScreenTransform");
    return true;
}


/**
 * Initialize callbacks specified in script ui
 * @returns boolean
 */

function initInputCallbacks() {
    if (script.callbackType > 0) {
        onColorChanged.add(ui.callbackFromScriptInputs("onColorChanged", script));
        onValueChanged.add(ui.callbackFromScriptInputs("onValueChanged", script));
    }
    return true;
}

// Initialize this interactable
function initInteractable() {
    // Initialize the Color
    updateColor();
    return true;
}

// Initialize Color Picker's initial location
function initLocalScreenPos() {
    setLocationOnPalette(new vec2(initialValueX, initialValueY));
    return true;
}

// Disable touch event
function disableTouchEvents() {
    script.allowTouchEvents = false;
}

// Enable touch event
function enableTouchEvents() {
    script.allowTouchEvents = true;
}

/**
 * Called On Touch Start
 * @param {TouchMoveEventArgs} eventArgs 
 * @returns 
 */
function touchStart(eventArgs) {
    if (!interactable) {
        return;
    }
    updatePickedLocationFromTouch(eventArgs);

    cursorIsSlideable = true;
    onPaletteTouchStart.trigger(eventArgs);
    onTouchStart.trigger(eventArgs);
}

/**
 * Called On Touch End
 * @param {TouchEndEventArgs} eventData 
 * @returns 
 */
function touchEnd(eventData) {
    if (!interactable) {
        return;
    }
    cursorIsSlideable = false;
    onTouchEnd.trigger(eventData);
}

/**
 * Called On Touch Move
 * @param {TouchMoveEventArgs} eventData 
 */
function touchMove(eventData) {
    if (!interactable) {
        return;
    }
    if (cursorIsSlideable) {
        updatePickedLocationFromTouch(eventData);
    }
    onTouchMove.trigger(eventData);
}

/**
 * Get current color
 * @returns vec4
 */
function getColor() {
    return new vec4(currentColor.r, currentColor.g, currentColor.b, currentColor.a);
}

/**
 * Get current color without alpha
 * @returns vec3 
 */
function getColorVec3() {
    return new vec3(currentColor.r, currentColor.g, currentColor.b);
}

/**
 * Get current slider value from 0 to 1
 * @returns number
 */
function getSliderValue() {
    return currentValue;
}
/**
 * Set current slider value
 * @param {number} value 
 */
function setSliderValue(value) {
    var pos = isVertical ? new vec2(localScreenPos.x, value) : new vec2(value, localScreenPos.x)
    setLocationOnPalette(pos);
}

/**
 * Update the color based on where the cursor is on the texture, and invoke callbacks
 */
function updateColor() {
    if (localScreenPos != null) {
        currentValue = getLocationOnPalette();

        // Full Palette
        if (script.paletteType == 0) {
            var hsx = currentValue;
            var hue = hsx * 360.0;
            var saturation = 1.0;
            var value = 1.0;

            if (hsx < 10.0 / 260.0) {
                value = hsx / (10.0 / 260.0);
            } else {
                value = 1.0;
            }

            if (hsx > 250.0 / 260.0) {
                saturation = (hsx - 1.0) / (-10.0 / 260.0);
            }

            var RGBAColor = HSVAtoRGBA(new vec4(hue, saturation * script.brightness, value * script.saturation, 1.0));

            currentColor = RGBAColor;
        } else if (script.paletteType == 1) { // 2-Color Palette
            currentColor = vec4.lerp(script.colorEnd, script.colorStart, currentValue);
        }
        // Invoke callbacks
        onColorChanged.trigger(currentColor);
        onValueChanged.trigger(currentValue);

        updateColorVisual();
    }
}

/**
 * Update palette from touch event data
 * @param {TouchStartEventArgs|TouchMoveEventArgs|TouchEndEventArgs} eventData 
 */
function updatePickedLocationFromTouch(eventData) {
    // Convert Palette data in screen space
    var newCursorLocation = paletteScreenTransform.screenPointToLocalPoint(eventData.position);
    newCursorLocation = newCursorLocation.uniformScale(0.5).add(new vec2(.5, .5));

    var newStepValueX = stepValueX / (maxValueX - minValueX);
    var newStepValueY = stepValueY / (maxValueY - minValueY);

    // Apply step value
    newCursorLocation.x = Math.round(newCursorLocation.x / newStepValueX) * newStepValueX;
    newCursorLocation.y = Math.round(newCursorLocation.y / newStepValueY) * newStepValueY;

    setLocationOnPalette(newCursorLocation);
}

/**
 * Return currently picked location local to Palette
 * @returns number
 */
function getLocationOnPalette() {
    return isVertical ? localScreenPos.y : localScreenPos.x;
}

/**
 * Set current location and automatically clamp to min and max
 * @param {vec2} proposedLocalScreenPos 
 * @returns 
 */
function setLocationOnPalette(proposedLocalScreenPos) {
    if (!interactable) {
        return;
    }
    // Clamp to the min and max local space values
    var proposedLocalScreenPosX = Math.min(Math.max(proposedLocalScreenPos.x, minEndpointX), maxEndpointX);
    var proposedLocalScreenPosY = Math.min(Math.max(proposedLocalScreenPos.y, minEndpointY), maxEndpointY);
    var clampedLocalScreenPos = new vec2(proposedLocalScreenPosX, proposedLocalScreenPosY);
    if (localScreenPos.distance(clampedLocalScreenPos) > 0.00000000000001) {
        // Update local screen position
        localScreenPos = clampedLocalScreenPos;
        updateCursorScreenAnchors();
        updateColor();
    }
}

/**
 * Update cursor anchors based on current location on palette
 */
function updateCursorScreenAnchors() {
    if (cursorScreenTransform) {
        var currentLocation = new vec2(localScreenPos.x, localScreenPos.y);
        // Map the location to min and max endpoints
        currentLocation.x = 2.0 * currentLocation.x - 1.0;
        currentLocation.y = 2.0 * currentLocation.y - 1.0;
        cursorScreenTransform.anchors.setCenter(currentLocation);
    }
}

/**
 * Return true if Color Picker is currently interactable, false otherwise
 * @returns boolean
 */

function isInteractable() {
    return interactable;
}

/**
 * Disable this Color Picker
 */
function disableInteractable() {
    if (!interactable) {
        return;
    }
    interactable = false;

    onDisableInteractable.trigger();

    printDebug("Disabled!");
}

/**
 * Enable this Color Picker
 */
function enableInteractable() {
    if (interactable) {
        return;
    }
    interactable = true;

    updateColor();

    onEnableInteractable.trigger();

    printDebug("Enabled!");
}

/**
 * Update color visuals based on the selected color
 */
function updateColorVisual() {
    paletteMaterial.mainPass.value = currentValue;

    if (script.colorRecipient) {
        script.colorRecipient.mainPass[script.colorParameterName] = currentColor;
    }
}

/**
 * Convert HSVA to RGBA color space
 * @param {vec4} hsva 
 * @returns vec4 
 */
function HSVAtoRGBA(hsva) {
    var h = hsva.r;
    var s = hsva.g;
    var v = hsva.b;
    var a = hsva.a;
    var r, g, b;

    var hprime = h / 60;

    const c = v * s;
    const x = c * (1 - Math.abs((hprime % 2) - 1));
    const m = v - c;

    if (!hprime) {
        r = 0;
        g = 0;
        b = 0;
    }

    if (hprime >= 0 && hprime < 1) {
        r = c;
        g = x;
        b = 0;
    }

    if (hprime >= 1 && hprime < 2) {
        r = x;
        g = c;
        b = 0;
    }

    if (hprime >= 2 && hprime < 3) {
        r = 0;
        g = c;
        b = x;
    }

    if (hprime >= 3 && hprime < 4) {
        r = 0;
        g = x;
        b = c;
    }

    if (hprime >= 4 && hprime < 5) {
        r = x;
        g = 0;
        b = c;
    }

    if (hprime >= 5 && hprime <= 6) {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return new vec4(r / 255.0, g / 255.0, b / 255.0, a);
}
/**
 * set render order of all children visuals
 * @returns {boolean}
 */
function initRenderOrder() {
    ui.setRenderOrderRecursively(sceneObject, script.renderOrderOverride);
    return true;
}

/**
 * checks if specified input provided and safely instantiates default prefab if not
 * @param {SceneObject} parent 
 * @param {string} name 
 * @param {ObjectPrefab} prefab 
 * @returns {SceneObject}
 */
function findOrInstantiate(parent, name, prefab) {
    var obj = ui.findChildObjectWithName(parent, name);
    if (!obj) {
        obj = manager.instantiatePrefab(prefab, parent);
        ui.setRenderLayerRecursively(obj, parent.layer);
        obj.layer = parent.layer;
        obj.name = name;
    }
    return obj;
}

/**
 * returns first component of type or safely creates new one
 * @param {SceneObject} obj 
 * @param {keyof ComponentNameMap} componentType 
 * @returns {Component}
 */
function getOrAddComponent(obj, componentType) {
    var component = obj.getComponent(componentType);
    if (isNull(component)) {
        printWarning(componentType + " component is not found, creating new" + componentType);
        return manager.createComponent(obj, componentType);
    }
    return component;
}

/**
 * Print debug message
 * @param {any} message 
 */
function printDebug(message) {
    if (script.printDebugStatements) {
        print(sceneObject.name + " - " + message);
    }
}

/**
 * Print warning message
 * @param {any} message 
 */
function printWarning(message) {
    if (script.printWarningStatements) {
        print(sceneObject.name + " - WARNING, " + message);
    }
}
