<script setup lang="ts">
import bivac from '../bivac'
import Table from './Table.vue'
import Row from './Row.vue'
import Cell from './Cell.vue'
import { computed, onMounted, onUnmounted, reactive, ref, type ComputedRef, type Ref } from 'vue';
import LoadingIcon from './icons/LoadingIcon.vue';

const props = defineProps<{
    id: string
}>()

const vol = computed(() => { return bivac.volumes.value[props.id] })

const forceBackup = ref(false)

const localLock = ref(false)

function backup() {
    localLock.value = true
    forceBackup.value = false
    bivac.backup(props.id, forceBackup.value)
}

const backupAvailable: ComputedRef<boolean> = computed(() => {
    if (localLock.value && vol.value.BackingUp) {
        localLock.value = false
    }
    const available = !(localLock.value || vol.value.BackingUp) || forceBackup.value
    return available
})

const backupLogs: ComputedRef<any> = computed(() => {
    if (typeof vol.value.Logs.backup === 'undefined') {
        return ''
    }
    const logLines = vol.value.Logs.backup.substr(4).split("\n") as string[]
    let parsedLog = null;
    while (parsedLog === null) {
        const line = logLines.pop() as string
        if (line.length > 0) {
            parsedLog = JSON.parse(line)
        }
    }
    let info: { [key: string]: any } = {};
    switch (parsedLog.message_type) {
        case 'summary':
            info['Bytes'] = {
                'processed': parsedLog.total_bytes_processed,
                'added': parsedLog.data_added
            }
            info['Files'] = {
                'processed': parsedLog.total_files_processed,
                'added': parsedLog.files_new,
                'modified': parsedLog.files_changed,
                'unchanged': parsedLog.files_unmodified
            }
            info['Directories'] = {
                'added': parsedLog.dirs_new,
                'modified': parsedLog.dirs_changed,
                'unchanged': parsedLog.dirs_unmodified
            }
            info['Snapshot ID'] = parsedLog.snapshot_id
            info['Required time'] = bivac.secondsToReadableTime(parsedLog.total_duration)
    }
    return info;
})

</script>

<template>
    <div class="wrapper">
        <div>
            <input type="checkbox" v-model="forceBackup" /> Force Backup
        </div>
        <div>
            <button class="backupButton" @click="backup()" :disabled="!backupAvailable">
                <template v-if="backupAvailable">
                    <div>Backup</div>
                </template>
                <template v-else>
                    <LoadingIcon />
                    <div>Backup running...</div>
                </template>
            </button>
        </div>
        <div>
            <Table v-if="typeof vol.Logs.backup !== 'undefined'">
                <Row v-for="(value, name) in backupLogs">
                    <Cell>{{ name }}</Cell>
                    <Cell>
                        <template v-if="typeof value === 'object'">
                            <Table>
                                <Row v-for="(subvalue, subname) in value">
                                    <Cell>{{ subname }}</Cell>
                                    <Cell>{{ subvalue }}</Cell>
                                </Row>
                            </Table>
                        </template>
                        <template v-else>{{ value }}</template>
                    </Cell>
                </Row>
            </Table>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    width: 100%;
    padding: 20px;
    border: 1px solid var(--color-border);
}

.backupButton {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8em;
    padding: 0.5em;
    width: 400px;
}

.backupButton div {
    display: inline-block;
}
</style>