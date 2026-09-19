const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      World = Matter.World,
      Bodies = Matter.Bodies; 

const engine = Engine.create();
const world = engine.world;

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
                restitution: 0.5, 
                friction: 0.2,    
                frictionAir: 0.05 
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

document.addEventListener('click', breakText);

document.addEventListener('mousemove', (event) => {
    if (hasFallen) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        wordBodies.forEach(item => {
            const body = item.body;
            const dx = body.position.x - mouseX;
            const dy = body.position.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 1. 큰 모니터 환경을 위해 마우스가 반응하는 반경을 늘림 (150 -> 250)
            if (distance < 250) {
                // 2. 글자의 '실제 무게(mass)'에 비례해서 밀어내는 힘을 주도록 수정!
                const forceMagnitude = 0.001 * body.mass; 
                Matter.Body.applyForce(body, body.position, {
                    x: (dx / distance) * forceMagnitude,
                    y: (dy / distance) * forceMagnitude - (0.001 * body.mass) // 위로 뜨는 힘도 무게에 비례
                });
            }
        });
    }
});
