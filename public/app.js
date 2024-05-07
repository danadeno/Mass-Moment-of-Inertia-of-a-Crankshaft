const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl-output').appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 50, 50);
scene.add(directionalLight);

const material = new THREE.MeshPhongMaterial({ color: 0x555555 });
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

function createVerticalObject(material, positionX, mass, radius = 0.5) {
    const geometry = new THREE.CylinderGeometry(radius, radius, 20, 32);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(positionX, 10, 0);

    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(radius, 10, 0);
    object.add(marker);

    object.userData = {
        rotating: false,
        angle: 0,
        cycles: 0,
        mass: mass,
        radius: radius,
        stiffness: 1000, // Adjustable as needed
        rotationStartTime: null,
        totalElapsedTime: 0,
        previousTime: 0
    };
    return object;
}

const crankshaft = createVerticalObject(material, -5, 1500);
const calibrationCylinder = createVerticalObject(material, 5, 3267);

scene.add(crankshaft);
scene.add(calibrationCylinder);

document.getElementById('toggle-crankshaft').addEventListener('click', function () {
    toggleRotation(crankshaft, 'crankshaft');
});

document.getElementById('toggle-cylinder').addEventListener('click', function () {
    toggleRotation(calibrationCylinder, 'cylinder');
});

document.getElementById('reset-crankshaft').addEventListener('click', function () {
    resetRotation(crankshaft, 'crankshaft');
});

document.getElementById('reset-cylinder').addEventListener('click', function () {
    resetRotation(calibrationCylinder, 'cylinder');
});

function toggleRotation(object, type) {
    object.userData.rotating = !object.userData.rotating;
    if (object.userData.rotating) {
        object.userData.rotationStartTime = performance.now();
        object.userData.previousTime = 0;
    }
}

function resetRotation(object, type) {
    object.userData.rotating = false;
    object.rotation.y = 0;
    object.userData.cycles = 0;
    object.userData.totalElapsedTime = 0;
    object.userData.previousTime = 0;
    document.getElementById(`stopwatch-${type}`).textContent = `${type} Time: 0s`;
    document.getElementById(`cycle-${type}`).textContent = `${type} Cycles: 0`;
}

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    [crankshaft, calibrationCylinder].forEach(object => {
        const type = object === crankshaft ? 'crankshaft' : 'cylinder';
        if (object.userData.rotating) {
            const timeSinceStart = (currentTime - object.userData.rotationStartTime) / 1000;
            object.userData.totalElapsedTime = timeSinceStart.toFixed(2);

            const angularVelocity = type === 'crankshaft' ? 2.618 : 1.745;  // radians per second
            object.rotation.y += angularVelocity * (timeSinceStart - object.userData.previousTime);

            if (object.rotation.y >= 2 * Math.PI) {
                object.rotation.y -= 2 * Math.PI;
                object.userData.cycles++;
                document.getElementById(`cycle-${type}`).textContent = `${type} Cycles: ${object.userData.cycles}`;
            }

            document.getElementById(`stopwatch-${type}`).textContent = `${type} Total Time: ${object.userData.totalElapsedTime}s`;
            object.userData.previousTime = timeSinceStart;
        }
    });

    renderer.render(scene, camera);
}

animate();
