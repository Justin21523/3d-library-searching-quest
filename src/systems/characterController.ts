import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export class CharacterController {
  private world: RAPIER.World;
  public controller: RAPIER.KinematicCharacterController;
  public body: RAPIER.RigidBody;
  public collider: RAPIER.Collider;
  private capsuleHeight: number;
  private capsuleRadius: number;
  private baseHeight: number;
  private crouchHeight: number;
  public isCrouching: boolean = false;
  private destroyed = false;
  public velocityY: number = 0;
  private readonly gravity = -22;
  private readonly jumpSpeed = 7;

  constructor(world: RAPIER.World, position: THREE.Vector3) {
    this.world = world;
    this.baseHeight = 1.8;
    this.crouchHeight = 1.0;
    this.capsuleHeight = this.baseHeight;
    this.capsuleRadius = 0.4;

    this.body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
        position.x,
        position.y + this.capsuleHeight / 2 + this.capsuleRadius,
        position.z
      )
    );

    this.collider = world.createCollider(
      RAPIER.ColliderDesc.capsule(this.capsuleHeight / 2, this.capsuleRadius),
      this.body
    );

    this.controller = world.createCharacterController(0.01);
    this.controller.enableAutostep(0.45, 0.2, true);
    this.controller.enableSnapToGround(0.6);
    this.controller.setSlideEnabled(true);
  }

  public getPosition(): THREE.Vector3 {
    const t = this.body.translation();
    return new THREE.Vector3(t.x, t.y, t.z);
  }

  public move(desiredVelocity: THREE.Vector3, jump: boolean, deltaTime: number) {
    if (this.destroyed) return;

    const grounded = this.controller.computedGrounded();

    if (grounded) {
      if (jump) {
        this.velocityY = this.jumpSpeed;
      } else {
        this.velocityY = -2; // small downward push to stay snapped to ground
      }
    } else {
      this.velocityY += this.gravity * deltaTime;
      if (this.velocityY < -40) this.velocityY = -40; // terminal velocity
    }

    const movement = new RAPIER.Vector3(
      desiredVelocity.x * deltaTime,
      this.velocityY * deltaTime,
      desiredVelocity.z * deltaTime
    );

    this.controller.computeColliderMovement(this.collider, movement);
    const corrected = this.controller.computedMovement();

    const currentPos = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: currentPos.x + corrected.x,
      y: currentPos.y + corrected.y,
      z: currentPos.z + corrected.z,
    });
  }

  public crouch(shouldCrouch: boolean) {
    if (this.destroyed || shouldCrouch === this.isCrouching) return;
    this.isCrouching = shouldCrouch;
    const targetHeight = shouldCrouch ? this.crouchHeight : this.baseHeight;
    this.world.removeCollider(this.collider, false);
    this.collider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(targetHeight / 2, this.capsuleRadius),
      this.body
    );
    this.capsuleHeight = targetHeight;
  }

  public destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    try {
      this.world.removeCharacterController(this.controller);
      this.world.removeRigidBody(this.body);
    } catch (_) {}
  }
}
