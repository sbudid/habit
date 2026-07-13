<template>
  <div class="rmterp">
    <div class="fzypcq">
      <slot />
    </div>
    <div class="iPbnzK"></div>
  </div>
</template>

<style lang="postcss" scoped>
.rmterp {
  @apply relative flex min-h-dvh items-center justify-center overflow-x-hidden;
}

.fzypcq {
  @apply z-10 mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-4 p-5;
  padding-top: max(1.25rem, env(safe-area-inset-top));
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
}

.iPbnzK {
  @apply fixed inset-0 min-h-dvh w-screen bg-cover bg-center blur transition-opacity duration-300;
  background-image: url('/bg/bg1.jpg');
}
</style>
