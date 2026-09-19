const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      World = Matter.World,
      Bodies = Matter.Bodies; 

const engine = Engine.create();
const world = engine.world;

// 안내 문구를 클릭으로 유도하도록 살짝 바꿨습니다.
const introText = "Hello! I am a creative designer based in Seoul. Welcome to my interactive portfolio. In the hushed glow of summer nights, a lonely dreamer drifts through life on the fringes... Click anywhere on the screen to break the layout!";
const textBox = document.getElementById('text-box');

const words = introText.split(' ');
words.forEach(word => {
    const span = document.createElement('span');
    span.classList.add('word');
    span.innerText = word;
    textBox.appendChild(span);
});

const w = window.innerWidth;
const h = window.innerHeight;
const wallOptions = { isStatic: true, render: { visible: false } };
World.add(world, [
    Bodies.rectangle(w / 2, h + 50, w, 100, wallOptions), 
    Bodies.rectangle(w / 2, -50, w, 100, wallOptions),    
    Bodies.rectangle(-50, h / 2, 100, h, wallOptions),    
    Bodies.rectangle(w + 50, h / 2, 100, h, wallOptions)  
]);

let wordBodies = [];
let hasFallen = false;

function breakText() {
    if (hasFallen) return; 
    hasFallen = true;

    const wordElements = document.querySelectorAll('.word');
    
    wordElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        
        const body = Bodies.rectangle(
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2, 
            rect.width, 
            rect.height, 
            {
                restitution: 0.5, // 0.8 -> 0.5 (탱탱볼처럼 튀는 느낌을 줄임)
                friction: 0.2,    
                frictionAir: 0.05 // 0.02 -> 0.05 (공기 저항을 높여서 우주/물 속처럼 부드럽고 천천히 날아가게)
            }
        );
        
        World.add(world, body);
        wordBodies.push({ el, body });
    });

    wordBodies.forEach(item => {
        item.el.style.position = 'fixed';
        item.el.style.left = '0px';
        item.el.style.top = '0px';
        item.el.style.margin = '0px'; 
    });

    requestAnimationFrame(update);
}

function update() {
    wordBodies.forEach(item => {
        const x = item.body.position.x - item.el.offsetWidth / 2;
        const y = item.body.position.y - item.el.offsetHeight / 2;
        const angle = item.body.angle;
        
        item.el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
    });
    requestAnimationFrame(update);
}

Runner.run(Runner.create(), engine);

// 1. 화면의 아무 곳이나 클릭해야만 무너지기 시작함!
document.addEventListener('click', breakText);

// 2. 마우스를 움직일 때의 반발력(밀어내는 힘) 대폭 감소
document.addEventListener('mousemove', (event) => {
    if (hasFallen) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        wordBodies.forEach(item => {
            const body = item.body;
            const dx = body.position.x - mouseX;
            const dy = body.position.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 마우스 커서 반경 150px (조금 더 가까이 가야 반응)
            if (distance < 150) {
                const forceMagnitude = 0.003; // 힘을 대폭 줄임 (0.03 -> 0.003) 너무 과격하지 않게
                Matter.Body.applyForce(body, body.position, {
                    x: (dx / distance) * forceMagnitude,
                    y: (dy / distance) * forceMagnitude - 0.005 // 살짝만 뜨도록 수정
                });
            }
        });
    }
});
