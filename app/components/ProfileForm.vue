<script setup lang="ts">
import { z } from 'zod';

const props = defineProps<{ user: User }>();
const emit = defineEmits<{ (e: 'profileUpdated'): void }>();
const { t, lang, setLang } = useI18n();

const schema = z.object({ userView: z.boolean() });
type Schema = z.infer<typeof schema>;

const formState = reactive<Schema>({ userView: !!props.user.userView });
const queryCache = useQueryCache();

const { mutate: editProfile } = useMutation({
  mutation: (data: Record<string, unknown>) => $fetch('/api/users', { method: 'PATCH', body: data }) as Promise<User>,
  async onSuccess() {
    await queryCache.invalidateQueries({ key: ['user'] });
    emit('profileUpdated');
  },
  onSettled() {
    formState.userView = !!props.user.userView;
  },
});

const updateProfile = () => editProfile({ userView: formState.userView });

const changeLang = (newLang: 'id' | 'en') => {
  setLang(newLang);
  editProfile({ lang: newLang });
};

const accountVisibilityMessage = computed(() => formState.userView ? t('publicAccountDesc') : t('privateAccountDesc'));

const { clear } = useUserSession();
const confirmDeleteAccount = ref(false);
const confirmationText = ref('');
const deleteConfirmText = computed(() => lang.value === 'id' ? 'hapus' : 'delete');

const closeDeleteConfirmation = () => { confirmationText.value = ''; confirmDeleteAccount.value = false; };

const { mutate: deleteAccount } = useMutation({
  mutation: () => $fetch('/api/users', { method: 'DELETE' }),
  async onSuccess() { await clear(); await navigateTo('/'); await queryCache.invalidateQueries({ key: ['user'] }); },
});
</script>

<template>
  <div class="p-8">
    <UForm :schema="schema" :state="formState" class="flex flex-col gap-4">
      <ContentBox class="flex items-center justify-between gap-14 bg-white/10 p-4 backdrop-blur-2xl dark:bg-neutral-200/5">
        <div class="flex flex-col gap-1">
          <div class="text-sm font-semibold text-white">{{ t('publicAccount') }}</div>
          <div class="text-xs text-white/60" v-html="accountVisibilityMessage"></div>
        </div>
        <UFormGroup name="userView">
          <UToggle v-model="formState.userView" @update:model-value="updateProfile" />
        </UFormGroup>
      </ContentBox>
      <ContentBox class="flex items-center justify-between gap-14 bg-white/10 p-4 backdrop-blur-2xl dark:bg-neutral-200/5">
        <div class="flex flex-col gap-1">
          <div class="text-sm font-semibold text-white">{{ t('language') }}</div>
          <div class="text-xs text-white/60">Bahasa antarmuka</div>
        </div>
        <div class="flex gap-1">
          <button @click="changeLang('id')" :class="['rounded-full px-3 py-1 text-xs font-medium transition', lang === 'id' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50']">🇮🇩 ID</button>
          <button @click="changeLang('en')" :class="['rounded-full px-3 py-1 text-xs font-medium transition', lang === 'en' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50']">🇺🇸 EN</button>
        </div>
      </ContentBox>
      <ContentBox class="flex flex-col gap-3 bg-white/10 p-4 backdrop-blur-2xl dark:bg-neutral-200/5">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-semibold text-white">{{ t('deleteAccount') }}</div>
          <div class="text-xs text-white/60">{{ t('deleteAccountDesc') }}</div>
        </div>
        <div class="flex items-center">
          <button @click="confirmDeleteAccount = true" class="button bg-red-600 px-3.5 py-1.5 font-semibold text-red-100 hover:bg-red-700">{{ t('deleteMyAccount') }}</button>
        </div>
      </ContentBox>
    </UForm>
  </div>
  <UModal v-model="confirmDeleteAccount" :ui="{ container: 'items-center', width: 'w-80', background: '', shadow: '', overlay: { base: 'backdrop-blur-2xl', background: 'bg-white/5 dark:bg-black/60' } }">
    <ContentBox class="flex flex-col gap-5 bg-white/10 p-6 backdrop-blur-2xl dark:bg-neutral-200/5">
      <div class="text-center text-xl font-semibold">{{ t('deleteAccountTitle') }}</div>
      <p class="px-6 text-center text-sm text-red-500">{{ t('deletePermanent') }}</p>
      <p class="text-xs text-neutral-400" v-html="t('typeDelete')"></p>
      <UInput color="red" v-model="confirmationText" :placeholder="t('typeDeleteHere')" />
      <div class="flex items-center gap-4">
        <UButton color="gray" class="flex-1 justify-center" @click="closeDeleteConfirmation">{{ t('close') }}</UButton>
        <UButton color="red" :disabled="confirmationText.toLowerCase() !== deleteConfirmText" @click="deleteAccount()">{{ t('deleteMyAccount') }}</UButton>
      </div>
    </ContentBox>
  </UModal>
</template>
