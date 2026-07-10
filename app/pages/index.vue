<script setup lang="ts">
const { user } = useUserSession();
const { t } = useI18n();

watchEffect(async () => {
  if (user.value) {
    await navigateTo(user.value.login);
  }
});
</script>

<template>
  <Card class="items-start justify-center gap-7 p-6">
    <div class="relative z-10 flex w-5/6 flex-col gap-5">
      <div class="h-12 w-12 rounded-2xl border-4 border-green-600 bg-green-400 shadow-lg"></div>
      <div class="text-lg font-medium">{{ t('landingTitle') }}</div>
      <div class="text-3xl font-medium" v-html="t('landingDesc').replace(/<n>/g, '<span class=&quot;text-green-400&quot;>').replace(/<\/n>/g, '</span>')"></div>
    </div>
    <div class="flex flex-col gap-2">
      <a href="/api/auth/github" class="button bg-white/20 px-2.5 py-2 hover:bg-white/30">
        <UIcon name="i-simple-icons-github" class="h-5 w-5" />
        {{ t('loginGithub') }}
      </a>
      <a href="/api/auth/google" class="button bg-white/20 px-2.5 py-2 hover:bg-white/30">
        <UIcon name="i-simple-icons-google" class="h-5 w-5" />
        {{ t('loginGoogle') }}
      </a>
    </div>
  </Card>
</template>
