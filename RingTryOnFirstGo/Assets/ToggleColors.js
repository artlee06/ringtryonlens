//@input Asset.Material[] materials
//@input Component.MeshVisual ringMesh
//@input Component.ScriptComponent toggleButton

var currentIndex = 0;

function setRingMaterial(index) {
    script.ringMesh.clearMaterials();
    script.ringMesh.addMaterial(script.materials[index]);
}

function onButtonPressed() {
    currentIndex = (currentIndex + 1) % script.materials.length;
    setRingMaterial(currentIndex);
}

script.toggleButton.onPressDown.add(onButtonPressed);

// Initialize
setRingMaterial(currentIndex);
