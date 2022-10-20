import "./styles.css";
import Phaser from "phaser";

// strawberry pic src: Fruit icons created by Freepik - Flaticon "https://www.flaticon.com/free-icons/fruit"
// game basics created by following Phaser tutorial https://phaser.io/tutorials/making-your-first-phaser-3-game/part1

let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);
let platforms;
let dude;
let stars;
let strawberries;
let strawberry;
let cursors;
let bombs;
let score = 0;
let scoreText;
let level = 1;
let levelText;
let gameOver = false;

function preload() {
  this.load.image("sky", "src/assets/sky.png");
  this.load.image("ground", "src/assets/platform.png");
  this.load.image("star", "src/assets/star.png");
  this.load.image("bomb", "src/assets/bomb.png");
  this.load.image("strawberry", "src/assets/strawberry.png");
  this.load.spritesheet("dude", "src/assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  //this.add.image(400, 300, 'star');
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  dude = this.physics.add.sprite(100, 450, "dude");
  dude.setBounce(0.2);
  dude.setCollideWorldBounds(true);
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
  dude.body.setGravityY(300);

  this.physics.add.collider(dude, platforms);
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });
  strawberries = this.physics.add.group();
  this.physics.add.collider(strawberries, platforms);

  function createStrawberry() {
    let strawberry = strawberries.create(20, 16, "strawberry");
    strawberry.setBounce(1);
    strawberry.setCollideWorldBounds(true);
    strawberry.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
  createStrawberry();
  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(dude, stars, collectStar, null, this);

  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000"
  });
  levelText = this.add.text(16, 50, "level: 1", {
    fontSize: "32px",
    fill: "#000"
  });
  this.physics.add.overlap(dude, strawberries, collectStrawberry, null, this);

  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(dude, bombs, hitBomb, null, this);

  function collectStar(dude, star) {
    star.disableBody(true, true);
    score += 10;

    scoreText.setText("Score: " + score);
    if (stars.countActive(true) === 0 && strawberries.countActive(true) === 0) {
      level += 1;
      levelText.setText("Level: " + level);
      stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });
      createStrawberry();

      let x =
        dude.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      let bomb = bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
  function collectStrawberry(dude, strawberry) {
    strawberry.disableBody(true, true);
    score += 20;
    scoreText.setText("Score: " + score);
    return scoreText;
  }

  function hitBomb(dude, bomb) {
    this.physics.pause();

    dude.setTint(0xff0000);

    dude.anims.play("turn");

    gameOver = true;
    let gameOverText = this.add.text(
      game.config.width / 2,
      game.config.height / 2,
      "GAME OVER",
      { fontSize: "32px", fill: "#cc00ff" }
    );
    // gameovertext code reference https://www.html5gamedevs.com/topic/39455-how-to-make-game-over-text/
  }
}

function update() {
  cursors = this.input.keyboard.createCursorKeys();
  if (cursors.left.isDown) {
    dude.setVelocityX(-160);

    dude.anims.play("left", true);
  } else if (cursors.right.isDown) {
    dude.setVelocityX(160);

    dude.anims.play("right", true);
  } else {
    dude.setVelocityX(0);

    dude.anims.play("turn");
  }

  if (cursors.up.isDown && dude.body.touching.down) {
    dude.setVelocityY(-500);
  }
}
