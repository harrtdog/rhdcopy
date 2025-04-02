const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

const balutImage = new Image();
balutImage.src = 'balut.png';  // Path to the balut image

const backgroundImage = new Image();
backgroundImage.src = 'manila.jpg';  // Mt. Mayon (Background 1)

const backgroundImage5000 = new Image();
backgroundImage5000.src = 'mt.jpg';  // Mt. Terrace (Background 2)

const backgroundImage10000 = new Image();
backgroundImage10000.src = 'palawann.jpg';  // Palawan (Background 3)

const backgroundImage15000 = new Image();
backgroundImage15000.src = 'chocolatehills.jpg';  // Chocolate Hills (Background 4)


const heartImage = new Image();
heartImage.src = 'huhu.png';

const obstacleImage = new Image();
obstacleImage.src = 'jip.png';

function resizeCanvas() {
    canvas.style.position = "absolute";
    canvas.style.top = "50%";
    canvas.style.left = "40%";
    canvas.style.transform = "translate(-50%, -50%)";
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const GRAVITY = 0.5;
const JUMP_STRENGTH = -14;
const DEATH_JUMP_STRENGTH = -20;
const WALK_SPEED = 5;
const OBSTACLE_SPEED = 5;
const OBSTACLE_WIDTH = 150;
const OBSTACLE_HEIGHT = 80;

let heart = {
    x: 160,
    y: canvas.height - 160,
    width: 100,
    height: 100,
    velocity: 0,
    jumping: false,
    moveLeft: false,
    moveRight: false,
    isDead: false,
    deathTimer: 0,
    rotation: 0,
    scaleY: 1,
    scaleX: 1,
};

let obstacles = [];
let score = 0;
let cameraX = 0;
let storyText = "";
let fullStoryText = "";
let typingEffectActive = false;
let typingTextTimer = 0;

let health = 100;  // Health bar value
let crashCount = 0;  // Count crashes to reset health and score

const groundY = canvas.height - 55;

let currentBackground = 4;

const storyTexts = {
    1: "Hey there, adventurer! 🌍 Ready to embark on an exciting journey through the rich culture of the Philippines? Your goal is to earn points by completing challenges, and once you reach the target score, you'll unlock breathtaking cultural landmarks across the country! 🏛️🌅",
    2: "Welcome to your first adventure! You’ve arrived at Mt. Taal, You’ve explored one of the most active and fascinating volcanoes in the Philippines. Known for its stunning crater lake, Mt. Taal is the second most active volcano in the country, constantly shaping the land with its power. Now that you've uncovered some of its secrets, it’s time to head to your next destination.",
    3: "Welcome to Palawan, a true paradise on Earth! 🌴🌊 After leaving the fiery landscape of Mt. Taal behind, This island is home to some of the most beautiful landscapes on the planet, including the UNESCO World Heritage-listed Puerto Princesa Underground River and the breathtaking Bacuit Bay. . Let the beauty of Palawan sweep you away!",
    4: "Welcome to the iconic Chocolate Hills of Bohol! 🍫⛰️ You've journeyed from Palawan’s paradise to these extraordinary natural formations. You've journeyed from Palawan’s paradise to this iconic geological formation. The Chocolate Hills are a series of over 1,200 cone-shaped hills that turn a rich, chocolate brown during the dry season, giving them their sweet name. These hills, created by thousands of years of erosion, have become one of the Philippines' most famous landmarks. Explore the landscape and uncover the history and beauty of this mysterious terrain!",
}
function updateHeart() {
  if (heart.isDead) {
      heart.velocity = DEATH_JUMP_STRENGTH;
      heart.y += heart.velocity;
      heart.deathTimer++;

      if (heart.deathTimer > 5 && heart.deathTimer <= 50) {
          heart.rotation -= 10;
          heart.scaleY -= 0.10;
          heart.scaleX -= 0.10;
      }

      if (heart.deathTimer > 50) {
          heart.isDead = false;
          heart.deathTimer = 0;
          heart.y = groundY - heart.height;
          heart.velocity = 0;
          heart.rotation = 0;
          heart.scaleY = 1;
          heart.scaleX = 1;
      }
  } else {
      // Check if the heart is flying
      if (canFly) {
          heart.velocity = -4;  // Move upwards

          // Prevent going above the top of the canvas (y >= 0)
          if (heart.y + heart.velocity <= 0) {
              heart.y = 0;  // Set to top of canvas
              heart.velocity = 0;  // Stop upward movement once at the top
          } else {
              heart.y += heart.velocity;
          }

          // Stop flying after the time limit
          if (Date.now() - flyTime > FLY_TIME_LIMIT) {
              canFly = false;  // End flying after the time limit
          }
      } else {
          // Apply gravity if not flying
          heart.velocity = heart.velocity + GRAVITY;
          heart.y += heart.velocity;

          // Ensure the character doesn't fall below the ground level
          if (heart.y >= groundY - heart.height) {
              heart.y = groundY - heart.height;
              heart.jumping = false;
              heart.velocity = 0;
          }
      }

      // Left and right movement
      if (heart.moveLeft) {
          heart.x -= WALK_SPEED;
      }

      if (heart.moveRight) {
          heart.x += WALK_SPEED;
      }

      if (heart.x < 0) heart.x = 0;
  }
}

let balut = {
  x: canvas.width + 300,  // Start closer to the right edge of the canvas
  y: groundY - 40,
  width: 30,
  height: 30,
  active: false,
};


let flyTime = 0;            // Timer for how long the heart can fly
const FLY_TIME_LIMIT = 1000;  // Fly time limit in milliseconds (2 seconds)
let canFly = false;         // To check if the heart can fly
function createBalut() {
  // Only create a new balut if it's not currently active
  if (!balut.active) {
      balut.x = canvas.width + 300;  // Position balut to the right side of the screen
      balut.y = groundY - 40;       // Ensure it's on the ground
      balut.active = true;           // Mark balut as active
  }

  // Move the balut towards the player (left direction)
  if (balut.active) {
      balut.x -= WALK_SPEED;  // Move towards the left side of the screen
  }

  // If balut has moved off-screen to the left, deactivate it
  if (balut.x + balut.width < 0) {
      balut.active = false;   // Deactivate balut when it moves off-screen
  }
}

function drawBalut() {
  if (balut.active) {
      // Draw the balut image if it's active and it's within the visible canvas area
      if (balutImage.complete) {
          ctx.drawImage(balutImage, balut.x - cameraX, balut.y, balut.width, balut.height);
      } else {
          console.log("Balut image not loaded yet");
      }
  }
}
function drawHeart() {
    ctx.save();

    if (heart.isDead) {
        ctx.translate(heart.x + heart.width / 2, heart.y + heart.height / 2);
        ctx.rotate(heart.rotation * Math.PI / 180);
        ctx.scale(heart.scaleX, heart.scaleY);
        ctx.drawImage(heartImage, -heart.width / 2, -heart.height / 2, heart.width, heart.height);
    } else {
        ctx.drawImage(heartImage, heart.x - cameraX, heart.y, heart.width, heart.height);
    }

    ctx.restore();
}

function createObstacle() {
    let obstacleX = canvas.width + 150 + cameraX;
    let obstacleY = groundY - OBSTACLE_HEIGHT;

    obstacles.push({
        x: obstacleX,
        y: obstacleY,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT,
    });
}

let jumpedOverObstacle = false;

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= OBSTACLE_SPEED;

        if (obstacles[i].x + obstacles[i].width < cameraX) {
            obstacles.splice(i, 1);
            i--;
            jumpedOverObstacle = false;
        }
    }
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacleImage.complete) {
            ctx.drawImage(obstacleImage, obstacles[i].x - cameraX, obstacles[i].y, obstacles[i].width, obstacles[i].height);
        } else {
            ctx.fillStyle = "green";
            ctx.fillRect(obstacles[i].x - cameraX, obstacles[i].y, obstacles[i].width, obstacles[i].height);
        }
    }
}
function detectBalutCollision() {
  // Check if the heart collides with the balut item
  if (
      heart.x + heart.width > balut.x &&
      heart.x < balut.x + balut.width &&
      heart.y + heart.height > balut.y
  ) {
      // Activate the fly ability
      canFly = true;
      flyTime = Date.now();  // Reset the fly time to the current time
      balut.active = false;  // Deactivate the balut item after it has been collected
  }
}

function detectCollisions() {
  for (let i = 0; i < obstacles.length; i++) {
      let obs = obstacles[i];

      // Check for collision between heart and obstacle
      if (
          heart.x + heart.width > obs.x &&
          heart.x < obs.x + obs.width &&
          heart.y + heart.height > obs.y &&
          !heart.jumping
      ) {
          // Health should be reduced only once when colliding with an obstacle
          if (!heart.isDead) {
              // Handle health bar reduction based on number of crashes
              if (crashCount === 0) {
                 health -= 10; 
              } else if (crashCount === 1) {
                  health = 50;
              } else if (crashCount === 2) {
                  health = 20;
              } else if (crashCount >= 3) {
                  score = 0;
                  health = 100;
                  crashCount = 0;
              }
              crashCount++; // Increment crash count after collision
          }

          // Set the heart as dead after collision and apply the death jump effect
          heart.isDead = true;
          showGameOver(); // Display the "Game Over" screen
          break; // Exit after the first collision, no need to check further obstacles
      }

      // Check if the heart is above the obstacle (jumping over it)
      if (
          heart.x + heart.width > obs.x &&
          heart.x < obs.x + obs.width &&
          heart.y + heart.height <= obs.y
      ) {
          if (!jumpedOverObstacle) {
              score += 10;  
              jumpedOverObstacle = true;
          }
      }
  }
}


function drawHealthBar() { 
  // Draw health bar border
  ctx.strokeStyle = "black"; 
  ctx.lineWidth = 3; 
  ctx.strokeRect(canvas.width - 220, 20, 200, 20); // Move the health bar up

  // Determine color based on health value
  let healthColor;
  if (health > 70) {
      healthColor = "green"; // Full health
  } else if (health > 30) {
      healthColor = "yellow"; // Medium health
  } else {
      healthColor = "red"; // Low health
  }

  // Draw background for the health bar
  ctx.fillStyle = "lightgray"; // Background (light gray)
  ctx.fillRect(canvas.width - 220, 20, 200, 20);  // Adjusted to move up

  // Draw the current health on top of the background
  ctx.fillStyle = healthColor; 
  ctx.fillRect(canvas.width - 220, 20, health * 2, 20); // Health bar progress

  // Display health value
  ctx.font = "15px Pixelify Sans"; 
  ctx.fillStyle = "black"; 
  ctx.fillText(health + "%", canvas.width - 120, 33); // Adjusted to align with the health bar
}


function drawScore() {
    ctx.font = "30px Pixelify Sans";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 20, 40);
}

function showGameOver() {
    ctx.font = "50px Pixelify Sans";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over!", canvas.width / 2 - 150, canvas.height / 2);
}

function startTypingEffect(message) {
    fullStoryText = message;
    storyText = "";
    typingEffectActive = true;
    typingTextTimer = 0;
}

function drawStory() {
    ctx.font = "18px 'Pixelify Sans', sans-serif"; 
    ctx.fillStyle = "white";

    const maxWidth = canvas.width - 40; 
    let words = storyText.split(" ");
    let line = "";
    let lines = [];

    // Create the text lines
    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        let width = ctx.measureText(testLine).width;

        if (width > maxWidth) {
            lines.push(line);
            line = words[i] + " ";
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    let yPosition = 80;
    for (let i = 0; i < lines.length; i++) {
        // Draw text outline (black or contrasting color)
        ctx.strokeStyle = "black"; // Outline color
        ctx.lineWidth = 2; // Outline width
        ctx.strokeText(lines[i], 20, yPosition); // Stroke the text to create an outline

        // Draw the actual text on top of the outline
        ctx.fillStyle = "white"; // Text color
        ctx.fillText(lines[i], 20, yPosition);

        yPosition += 30; // Adjust vertical position for each line
    }

    if (typingEffectActive && typingTextTimer < fullStoryText.length) {
        typingTextTimer++;
        storyText = fullStoryText.substring(0, typingTextTimer);
    }
}

function updateBackgroundAndStory() {
    if (score >= 100) {
        if (backgroundImage15000.complete) {
            ctx.drawImage(backgroundImage15000, 0, 0, canvas.width, canvas.height);
            if (currentBackground !== 4) {
                startTypingEffect(storyTexts[4]);  // Assuming you want to show storyText[4] for Chocolate Hills
                currentBackground = 4;
            }
        }
    } else if (score >= 50) {
        if (backgroundImage10000.complete) {
            ctx.drawImage(backgroundImage10000, 0, 0, canvas.width, canvas.height);
            if (currentBackground !== 3) {
                startTypingEffect(storyTexts[3]);  // Palawan story text
                currentBackground = 3;
            }
        }
    } else if (score >= 30) {
        if (backgroundImage5000.complete) {
            ctx.drawImage(backgroundImage5000, 0, 0, canvas.width, canvas.height);
            if (currentBackground !== 2) {
                startTypingEffect(storyTexts[2]);  // Mt. Mayon story text
                currentBackground = 2;
            }
        }
    } else {
        if (backgroundImage.complete) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            if (currentBackground !== 1) {
                startTypingEffect(storyTexts[1]);  // Mt. Taal story text
                currentBackground = 1;
            }
        }
    }
}

// Decrease health over time
function decrementHealthOverTime() {
    if (health > 0) {
        health -= 0.1;  // Health decreases over time
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackgroundAndStory();

    createBalut();  // Create the balut item
    detectBalutCollision();  // Check for collision with balut
    drawBalut();  // Draw the balut item


    updateHeart();
    drawHeart();
    updateObstacles();
    drawObstacles();
    detectCollisions();

    drawScore();
    drawHealthBar();  // Draw the health bar
    drawStory();

    if (heart.x > cameraX + canvas.width / 2) {
        cameraX = heart.x - canvas.width / 2;
    }

   
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowUp" || event.key === "w") {
        if (!heart.jumping && !heart.isDead) {
            heart.velocity = JUMP_STRENGTH;
            heart.jumping = true;
        }
    }
    if (event.key === "ArrowLeft" || event.key === "a") {
        heart.moveLeft = true;
    }
    if (event.key === "ArrowRight" || event.key === "d") {
        heart.moveRight = true;
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "ArrowLeft" || event.key === "a") {
        heart.moveLeft = false;
    }
    if (event.key === "ArrowRight" || event.key === "d") {
        heart.moveRight = false;
    }
});

setInterval(createObstacle, 3000);

gameLoop();
