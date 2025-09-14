//@input Component.RenderMeshVisual[] diamonds
//@input Component.ScriptComponent toggleButton

var currentIndex = 0;

function showDiamond(index) {
    // Ensure we have diamonds and valid index
    if (!script.diamonds || script.diamonds.length === 0) {
        return;
    }
    
    // Clamp index to valid range
    index = Math.max(0, Math.min(index, script.diamonds.length - 1));
    
    // Hide all diamonds first
    for (var i = 0; i < script.diamonds.length; i++) {
        if (script.diamonds[i] && script.diamonds[i].enabled !== undefined) {
            script.diamonds[i].enabled = false;
        }
    }
    
    // Show the selected diamond
    if (script.diamonds[index] && script.diamonds[index].enabled !== undefined) {
        script.diamonds[index].enabled = true;
    }
}

function onButtonPressed() {
    currentIndex = (currentIndex + 1) % script.diamonds.length;
    showDiamond(currentIndex);
}

script.toggleButton.onPressDown.add(onButtonPressed);

// Initialize - show first diamond, hide others
showDiamond(currentIndex);
