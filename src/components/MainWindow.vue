<template>
  <div class="card">
    <div class="content">
      <div class="title">视频格式转换插件</div>
      <div class="slogan">将其他格式的视频转换为 MP4 格式</div>
      <a-divider></a-divider>
      <a-button :disabled="disabled" :loading="disabled" shape="round" type="primary" @click="open">选择视频并立即转换
      </a-button>
      <a-upload v-model:file-list="fileList" :show-retry-button="false"
                :auto-upload="false" :show-upload-button="false" action="/" tip="将其他视频转换为 MP4 格式"
      />
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

let fileList = ref([]);
let disabled = ref(false);

const open = async () => {
  const filePath = await window.electronAPI.openFile();
  if (filePath.length === 0) {
    return
  }
  disabled.value = true;
  filePath.forEach((path, index) => {
    fileList.value.push({
      uid: (-index - 1).toString(),
      name: path.substring(path.lastIndexOf('\\') + 1),
      status: 'wait',
      percent: 0,
    });
  });

  for (const path of filePath) {
    const index = filePath.indexOf(path);
    fileList.value[index].status = 'uploading';
    await window.electronAPI.execFFmpeg(path)
        .then((progress) => {
          fileList.value[index].percent = progress/100;
          if (progress === 100) {
            fileList.value[index].status = 'done';
          }
        })
        .catch((err) => {
          console.log(err);
          fileList.value[index].status = 'error';
          fileList.value[index].percent = 0;
        });
  }
  disabled.value = false;
}

</script>

<style scoped>
.card {
  width: 411px;
  min-height: 335px;
  border-radius: 0 0 8px 8px;
  background: var(--color-bg-2);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 1em;
  transition: all 0.3s ease;
}

.content {
  padding: 0 5px;
}

.slogan {
  vertical-align: middle;
  color: #656f94;
}

.title {
  font-family: Nunito Sans, system-ui;
  font-weight: 700;
  font-size: 22px;
  vertical-align: middle;
  line-height: 46px;
}

</style>