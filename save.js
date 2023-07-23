import * as THREE from 'three'
import { WEBGL } from './webgl'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// WebGL을 지원하는지 확인
if (WEBGL.isWebGLAvailable()) {
  // 씬 생성
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xCFE1F1);

  // 카메라 생성
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(100, 100, 200);

  // 렌더러 생성
  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  document.body.appendChild(renderer.domElement);

  // 조명 생성
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
  

  let rotationSpeed = 0.493;

  // 회전 애니메이션 함수
  const rotateScene = () => {
    // 씬 회전
    scene.rotation.y += rotationSpeed;

    // 회전 속도를 서서히 감소
    rotationSpeed *= 0.98;

    // 회전 속도가 일정 이하로 떨어졌을 때 카메라 위치로 이동
    if (rotationSpeed < 0.001) {
      // 카메라 위치로 이동 애니메이션
      const targetPosition = new THREE.Vector3(210, 100, 200);
      const currentPosition = camera.position.clone();

      // 보간된 카메라 위치로 이동
      camera.position.lerp(targetPosition, 0.05);

      // 카메라 위치에 도착하면 애니메이션 종료
      if (camera.position.distanceTo(targetPosition) < 0.1) {
        cancelAnimationFrame(rotateScene);
        animate();
      }
    } else {
      // 회전이 멈출 때까지 재귀적으로 애니메이션 프레임 요청
      requestAnimationFrame(rotateScene);
    }
  };

  // 초기 회전 애니메이션 시작
  rotateScene();


  // 카메라 컨트롤 생성
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 100;
  controls.maxDistance = 400;
  controls.update();

  // 로딩 매니저 설정
  const lodingm = new THREE.LoadingManager()
  const bar = document.getElementById('bar');
  const loding_r = document.querySelector('.loding');

  // 로딩 중일 때의 진행 상태 업데이트
  lodingm.onProgress = (url, loaded, total) => {
    bar.value = (loaded / total) * 100;
  };

  // 로딩이 완료되었을 때 로딩 UI 숨김
  lodingm.onLoad = () => {
    loding_r.style.display = 'none';
  };


  // 모델 애니메이션을 위한 믹서
  var mixer = null;

  // GLTF 로더를 사용하여 모델 로드
  const loader = new GLTFLoader(lodingm);
  loader.load('./static/models/whale.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(3, 3, 3);


    // 모델을 오른쪽으로 이동시키기 위한 벡터
    const moveRightVector = new THREE.Vector3(20, 0, 0);
    model.position.add(moveRightVector);

    // glTF 파일에 애니메이션이 있는 경우
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const animation = mixer.clipAction(gltf.animations[0]);
      animation.setLoop(THREE.LoopRepeat);
      animation.play();
    }

    // 씬에 모델 추가
    scene.add(model);

    // 애니메이션 프레임 업데이트 함수
    const animate = () => {
      requestAnimationFrame(animate);

      // 믹서 업데이트
      if (mixer) {
        mixer.update(0.016);
      }

      // 씬 렌더링
      renderer.render(scene, camera);
    };

    animate();
  });



  loader.load('./static/models/sea.glb', (gltf) => {
    const model = gltf.scene;

    // 크기 조절
    const scale = 6; // 원하는 크기로 조절
    model.position.y = -50;
    model.scale.set(scale, scale, scale);
    const opacity = 0.6; // 원하는 투명도 값 (0.0 ~ 1.0)
    model.traverse((node) => {
      if (node.isMesh) {
        node.material.transparent = true;
        node.material.opacity = opacity;
      }
    });


  // 씬에 모델 추가
  scene.add(model);

  // 애니메이션 프레임 업데이트 함수
  const animate = () => {
    requestAnimationFrame(animate);

    // 애니메이션 또는 모델 변환 등 추가 로직

    // 씬 렌더링
    renderer.render(scene, camera);
  };

  animate();
});
const modelPaths = [
  "./static/models/trash/plastic_bag_dirty_3.glb",
  "./static/models/trash/trashbox.glb",
  "./static/models/trash/plastic_bottle.glb",
  "./static/models/trash/plastic_bottle_with_droplets_and_haze.glb",
  "./static/models/trash/plastic_cup.glb",
  "./static/models/trash/plastic_wheel.glb",
];

const numInstances = 7; // 생성할 인스턴스 개수
const instances = []; // 인스턴스들을 담을 배열
const cubeSize = new THREE.Vector3(100, 50, 100);
const raycaster = new THREE.Raycaster();

for (let i = 0; i < numInstances; i++) {
  createNewInstance();
}

const animate = () => {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(0.016);
  }

  instances.forEach((instance) => {
    const movementSpeed = instance.userData.movementSpeed;

    instance.rotateX(0.001);
    instance.rotateY(0.001);
    instance.rotateZ(0.001);

    instance.position.y += movementSpeed;

    if (instance.position.y > cubeSize.y / 2 || instance.position.y < -cubeSize.y / 2) {
      instance.userData.movementSpeed *= -1;
    }
  });

  renderer.render(scene, camera);
};

document.addEventListener('click', handleInput);
document.addEventListener('touchstart', handleInput);

function handleInput(event) {
  const input = event.type === 'click' ? event : event.touches[0];

  const mouse = new THREE.Vector2(
    (input.clientX / window.innerWidth) * 2 - 1,
    -(input.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(instances, true);

  if (intersects.length > 0) {
    const clickedInstance = intersects[0].object;
    fadeOutInstance(clickedInstance);
  }
}


function createNewInstance() {
  const randomModelIndex = Math.floor(Math.random() * modelPaths.length);
  const modelPath = modelPaths[randomModelIndex];

  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;

    const instance = model.clone();

    const position = new THREE.Vector3(
      THREE.MathUtils.randFloat(-cubeSize.x / 2, cubeSize.x / 2),
      THREE.MathUtils.randFloat(-cubeSize.y / 2, cubeSize.y / 2),
      THREE.MathUtils.randFloat(-cubeSize.z / 2, cubeSize.z / 2)
    );
    instance.position.copy(position);

    const rotation = new THREE.Euler(
      THREE.MathUtils.randFloat(0, Math.PI * 2),
      THREE.MathUtils.randFloat(0, Math.PI * 2),
      THREE.MathUtils.randFloat(0, Math.PI * 2)
    );
    instance.setRotationFromEuler(rotation);

    const movementSpeed = THREE.MathUtils.randFloat(0.01, 0.02);
    instance.userData = {
      movementSpeed,
      opacity: 1,
      isFadingOut: false,
    };

    if (modelPath === "./static/models/trash/plastic_bottle_with_droplets_and_haze.glb") {
      instance.scale.set(10, 10, 10);
    } else {
      instance.scale.set(5, 5, 5);
    }

    scene.add(instance);

    // 서서히 나타나도록 fadeInInstance 함수 호출
    fadeInInstance(instance, () => {
      instances.push(instance);
    });
  });
}

function fadeInInstance(instance, callback) {
  const startTimestamp = performance.now();
  const duration = 1000; // 애니메이션 지속 시간 (밀리초)

  function updateOpacity(timestamp) {
    const elapsed = timestamp - startTimestamp;
    let progress = elapsed / duration;

    if (progress > 1) progress = 1;

    const opacity = progress; // 투명도 보간

    instance.traverse((child) => {
      if (child.isMesh) {
        child.material.opacity = opacity;
        child.material.transparent = true;
      }
    });

    if (progress < 1) {
      requestAnimationFrame(updateOpacity);
    } else {
      if (callback) callback(); // 콜백 함수 호출
    }
  }

  requestAnimationFrame(updateOpacity);
}

function fadeOutInstance(instance) {
  if (instance.userData.isFadingOut) return; // 이미 사라지는 중인 경우 중복 실행 방지

  instance.userData.isFadingOut = true; // 사라지는 중인 상태로 설정
  const startTimestamp = performance.now();

  function updateOpacity(timestamp) {
    const elapsed = timestamp - startTimestamp;
    let progress = elapsed / 1000; // 1초 동안 애니메이션 실행

    if (progress > 1) progress = 1; // 애니메이션 완료 후 투명도 고정

    const opacity = 1 - progress; // 투명도 보간

    instance.traverse((child) => {
      if (child.isMesh) {
        child.material.opacity = opacity;
        child.material.transparent = true;
      }
    });

    instance.userData.opacity = opacity;

    if (progress < 1) {
      requestAnimationFrame(updateOpacity);
    } else {
      instance.userData.isFadingOut = false; // 애니메이션이 끝나면 사라지는 중인 상태 해제
      scene.remove(instance); // 인스턴스를 씬에서 제거

      createNewInstance(); // 새로운 인스턴스 생성
    }
  }

  requestAnimationFrame(updateOpacity);
}

// animate 함수 호출
animate();


  // 창 크기 조정 시 카메라 및 렌더러 크기 업데이트
  function onWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindow);

} else {
  // WebGL을 지원하지 않을 때 경고 메시지 표시
  var warning = WEBGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}
