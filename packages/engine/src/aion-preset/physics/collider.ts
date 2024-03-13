// /**
//  * Configure the collider given the rapier body options of the entity.
//  * @param colliderDesc
//  * @param options
//  * @returns colliderDesc
//  */
// export function setColliderOptions(
//   colliderDesc: RAPIER.ColliderDesc,
//   options: RColliderOptions,
// ) {
//   if (options.events) {
//     colliderDesc.setActiveEvents(options.events)
//   }

//   if (options.activeCollisions) {
//     colliderDesc.setActiveCollisionTypes(options.activeCollisions)
//   }

//   if (options.activeHooks) {
//     colliderDesc.setActiveHooks(options.activeHooks)
//   }

//   if (options.contactForceEventThreshold) {
//     colliderDesc.setContactForceEventThreshold(
//       options.contactForceEventThreshold,
//     )
//   }

//   if (options.density) {
//     colliderDesc.setDensity(options.density)
//   }

//   if (options.friction) {
//     colliderDesc.setFriction(options.friction)
//   }

//   if (options.sensor) {
//     colliderDesc.setSensor(options.sensor)
//   }

//   if (options.mass) {
//     colliderDesc.setMass(options.mass)
//   }

//   if (
//     options.mass &&
//     options.centerOfMass &&
//     options.principalAngularIntertia
//   ) {
//     colliderDesc.setMassProperties(
//       options.mass,
//       options.centerOfMass,
//       options.principalAngularIntertia,
//     )
//   }

//   if (options.restitution) {
//     colliderDesc.setRestitution(options.restitution)
//   }

//   if (options.solverGroups) {
//     colliderDesc.setSolverGroups(options.solverGroups)
//   }

//   if (options.frictionCombineRule) {
//     colliderDesc.setFrictionCombineRule(options.frictionCombineRule)
//   }
// }
