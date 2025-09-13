//@input Asset.Material[] materials
//@input Component.MeshVisual ringMesh
//@input Component.ScriptComponent toggleButton

var currentIndex = 0;
var canPress = true;

function setRingMaterial(index) {
    script.ringMesh.clearMaterials();
    script.ringMesh.addMaterial(script.materials[index]);
}

function onButtonPressed() {
    if (canPress) {
        canPress = false;
        currentIndex = (currentIndex + 1) % script.materials.length;
        setRingMaterial(currentIndex);
        
        // Re-enable after a short delay to prevent rapid clicking
        var delayedEvent = script.createEvent("DelayedCallbackEvent");
        delayedEvent.bind(function() {
            canPress = true;
        });
        delayedEvent.reset(0.2); // 200ms delay
    }
}

script.toggleButton.onPress.add(onButtonPressed);

// Initialize
setRingMaterial(currentIndex);
