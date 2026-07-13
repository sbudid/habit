<script setup lang="ts">
import { format } from 'date-fns';

const config = useRuntimeConfig();
const currentYear = format(new Date(), 'yyyy');
</script>

<template>
  <div class="mt-2 flex flex-col items-center justify-center gap-1 text-center text-xs text-neutral-400">
    <div>
      <span class="font-semibold text-white/70">Rutina</span>
      <span class="mx-1">v{{ config.public.version }}</span>
      <span>· {{ currentYear }}</span>
    </div>
    <div class="text-[11px] text-white/35">
      Pelacak kebiasaan keluarga Indonesia.
    </div>
  </div>
</template>
