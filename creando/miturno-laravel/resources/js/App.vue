<template>
    <Toast position="top-right" />
    <ConfirmDialog />
    <router-view />
</template>

<script setup>
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
</script>

<style>
body {
    margin: 0;
    font-family: sans-serif;
}
</style>
