<template>
  <q-card class="q-ml-xs q-mr-xs shadow-2">
    <q-card-section class="cursor-pointer" @click="isMobile && (expanded = !expanded)">
      <div class="row items-center justify-between">
        <div class="col full-width">
          <div class="row items-center justify-between">
            <!-- LEFT: TASK ID -->
            <div class="text-subtitle2 text-bold text-grey">
              {{ task.id }}
            </div>

            <!-- RIGHT: ACTION BUTTONS -->
            <div v-if="!task.discussion" class="row items-center q-gutter-xs">
              <!-- Ellipsis -->
              <q-btn flat dense round size="sm" icon="more_vert" color="grey-7" @click.stop>
                <q-menu auto-close>
                  <q-list style="min-width: 150px">
                    <q-item v-if="enableStart" clickable @click="updateStatus('Started')">
                      <q-item-section avatar>
                        <q-icon name="play_arrow" color="primary" />
                      </q-item-section>
                      <q-item-section>Start</q-item-section>
                    </q-item>

                    <q-item v-if="enableBlock" clickable @click="updateStatus('Blocked')">
                      <q-item-section avatar>
                        <q-icon name="block" color="negative" />
                      </q-item-section>
                      <q-item-section>Block</q-item-section>
                    </q-item>

                    <q-item v-if="enableResume" clickable @click="updateStatus('Resumed')">
                      <q-item-section avatar>
                        <q-icon name="play_arrow" color="primary" />
                      </q-item-section>
                      <q-item-section>Resume</q-item-section>
                    </q-item>

                    <q-item v-if="enableComplete" clickable @click="updateStatus('Completed')">
                      <q-item-section avatar>
                        <q-icon name="check_circle" color="positive" />
                      </q-item-section>
                      <q-item-section>Complete</q-item-section>
                    </q-item>
                    <q-item v-if="enableRestart" clickable @click="updateStatus('Restarted')">
                      <q-item-section avatar>
                        <q-icon name="restart_alt" color="positive" />
                      </q-item-section>
                      <q-item-section>Restart</q-item-section>
                    </q-item>
                    <q-item clickable @click.stop="$emit('edit', task)">
                      <q-item-section avatar>
                        <q-icon name="edit" color="grey-7" />
                      </q-item-section>
                      <q-item-section>Update</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>

          <q-separator />
          <div :class="`text-h6 text-${titleColor}`">
            {{ task.title }}
          </div>

          <div
            class="text-body2 text-grey-7 description-text outlined-description"
            :class="{ 'clamped-description': isMobile && !expanded }"
          >
            <!-- <q-span class="text-grey-7 text-bold">Description:</q-span> -->
            {{ task.description }}
          </div>

          <!-- <div v-if="!expanded && isMobile" class="q-mb-sm q-mt-sm">
            <q-separator />
          </div> -->
          <div class="row items-center full-width" v-if="!expanded && isMobile">
            <!-- LEFT FLEXIBLE SECTION -->
            <div v-if="task.assigneeName" class="row items-center q-gutter-sm col">
              <q-avatar :color="avatarColor" text-color="white">
                {{ task.assigneeName.charAt(0) }}
              </q-avatar>

              <div class="text-caption ellipsis">{{ task.assigneeName }}</div>
            </div>
            <div v-else class="row items-center q-gutter-sm col">
              <div class="text-caption text-bold">Not Assigned</div>
            </div>

            <!-- RIGHT FIXED SECTION -->
            <!-- <q-circular-progress
              show-value
              :value="task.progress"
              size="40px"
              :thickness="0.18"
              :color="progressColor"
              track-color="grey-3"
            >
              <template v-slot:default>
                <div class="text-caption text-weight-bold">{{ task.progress }}%</div>
              </template>
            </q-circular-progress> -->
          </div>
        </div>
      </div>
    </q-card-section>
    <transition name="expand">
      <div v-show="!isMobile || expanded" class="expand-content">
        <q-card-section>
          <div v-if="task.assigneeName" class="row items-center q-gutter-sm col">
            <q-avatar :color="avatarColor" text-color="white">
              {{ task.assigneeName.charAt(0) }}
            </q-avatar>

            <div class="text-caption ellipsis">{{ task.assigneeName }}</div>
          </div>
          <div v-else class="row items-center q-gutter-sm col">
            <div class="text-caption text-bold">Not Assigned</div>
          </div>

          <!-- DATES SECTION -->
          <div class="q-mt-md date-section">
            <!-- Creation Date -->
            <div class="row items-center q-gutter-xs text-caption text-grey-8">
              <q-icon name="event" size="16px" />
              <span class="date-label">Created:</span>
              <span>{{ formattedCreatedDate }}</span>
            </div>
            <!-- Creation Date -->
            <div class="row items-center q-gutter-xs text-caption text-grey-8">
              <q-icon name="event" size="16px" />
              <span class="date-label">Started:</span>
              <span v-if="task.startedAt">{{ formattedStartedDate }}</span>
              <span v-else>{{ 'Not Started' }}</span>
            </div>
            <div class="row items-center q-gutter-xs text-caption text-grey-8">
              <q-icon name="event" size="16px" />
              <span class="date-label">Completion Days:</span>
              <span>{{ task.anticipatedDays }}</span>
            </div>
            <!-- Anticipated Completion -->
            <div class="row items-center q-gutter-xs text-caption text-grey-8 q-mt-xs">
              <q-icon name="schedule" size="16px" />
              <span class="date-label">Expected Completion:</span>
              <span>{{ formattedCompletionDate }}</span>
              <span v-if="task.startedAt">{{ formattedCompletionDate }}</span>
              <span v-else>{{ 'Yet to Start' }}</span>
            </div>
          </div>
        </q-card-section>
      </div>
    </transition>
    <q-separator />
    <q-card-section class="row justify-between q-gutter-md">
      <!-- PRIORITY -->
      <div class="column items-start">
        <div class="text-caption text-grey-7 text-weight-medium">Priority</div>

        <q-badge :color="priorityColor" class="q-mt-xs badge-style">
          <q-icon :name="priorityIcon" size="14px" class="q-mr-xs" />
          {{ task.priority }}
        </q-badge>
      </div>

      <!-- STATUS -->
      <div class="column items-start">
        <div class="text-caption text-grey-7 text-weight-medium">Status</div>

        <q-badge :color="statusColor" class="q-mt-xs badge-style">
          <q-icon :name="statusIcon" size="14px" class="q-mr-xs" />
          {{ task.status }}
        </q-badge>
      </div>
      <!-- PROGRESS -->
      <div class="column items-start">
        <div class="text-caption text-grey-7 q-mb-xs">Progress</div>

        <q-circular-progress
          show-value
          :value="task.progress"
          size="40px"
          :thickness="0.18"
          :color="progressColor"
          track-color="grey-3"
        >
          <template v-slot:default>
            <div class="text-caption text-weight-bold">{{ task.progress }}%</div>
          </template>
        </q-circular-progress>
      </div>
      <!-- DISCUSSION -->
      <div v-if="!task.discussion" class="column items-start">
        <div class="text-caption text-grey-7 text-weight-medium">Discussion</div>

        <q-btn
          flat
          dense
          round
          icon="forum"
          color="primary"
          class="q-mt-xs"
          @click.stop="openDiscussion"
        />
      </div>
    </q-card-section>
    <!-- <q-card-section>
      <div class="q-mt-md">
        <q-slider v-model="progress" :min="0" :max="100" label label-always class="q-mt-sm" />
      </div>
    </q-card-section> -->
  </q-card>
</template>

<script>
import { randomColor, getAvatarColor } from 'src/services/CommonUtils'
export default {
  props: { task: Object },

  watch: {
    'task.progress'(val) {
      if (val === 100) {
        this.updateStatus('Completed')
      }
    },
  },
  computed: {
    progress() {
      return this.task.progress
    },
    enableStart() {
      return !!this.task.assigneeId && this.task.status === 'Not Started'
    },
    enableBlock() {
      return (
        !!this.task.assigneeId &&
        (this.task.status === 'Started' ||
          this.task.status === 'Restarted' ||
          this.task.status === 'Resumed')
      )
    },
    enableComplete() {
      return (
        !!this.task.assigneeId &&
        (this.task.status === 'Started' ||
          this.task.status === 'Restarted' ||
          this.task.status === 'Resumed')
      )
    },
    enableResume() {
      return !!this.task.assigneeId && this.task.status === 'Blocked'
    },
    enableRestart() {
      return !!this.task.assigneeId && this.task.status === 'Completed'
    },
    isMobile() {
      return this.$q.screen.lt.md
    },
    titleColor() {
      return randomColor(this.task.title)
    },
    avatarColor() {
      return getAvatarColor(this.task.title)
    },
    progressColor() {
      if (this.task.progress < 30) return 'red'
      if (this.task.progress < 70) return 'orange'
      return 'green'
    },
    formattedCreatedDate() {
      if (!this.task.createdAt) return '-'

      return new Date(this.task.createdAt).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    formattedCompletionDate() {
      if (!this.task.startedAt || !this.task.anticipatedDays) return '-'

      const completionTime = this.task.startedAt + this.task.anticipatedDays * 24 * 60 * 60 * 1000

      return new Date(completionTime).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    formattedStartedDate() {
      return new Date(this.task.startedAt).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    priorityColor() {
      const map = {
        Low: 'green',
        Medium: 'orange',
        High: 'red',
        'On Fire': 'deep-orange',
      }
      return map[this.task.priority]
    },
    priorityIcon() {
      const map = {
        Low: 'arrow_downward',
        Medium: 'remove',
        High: 'arrow_upward',
        'On Fire': 'local_fire_department',
      }
      return map[this.task.priority]
    },
    statusColor() {
      const map = {
        New: 'grey',
        Assigned: 'blue',
        Started: 'purple',
        Blocked: 'red',
        Completed: 'green',
      }
      return map[this.task.status]
    },
    statusIcon() {
      const map = {
        'Not Started': 'hourglass_empty',
        Started: 'play_arrow',
        Blocked: 'block',
        Resumed: 'play_arrow',
        Restarted: 'restart_alt',
        Completed: 'check_circle',
      }
      return map[this.task.status]
    },
  },
  data() {
    return {
      expanded: false,
    }
  },
  methods: {
    updateStatus(newStatus) {
      this.$emit('status-update', {
        taskId: this.task.id,
        status: newStatus,
      })
    },

    openDiscussion() {
      this.$emit('discussion', this.task)
    },
  },
}
</script>

<style scoped>
.badge-style {
  font-size: 12px;
  border-radius: 8px;
}
.date-section {
  padding-left: 40px; /* aligns under avatar */
}

.date-label {
  font-weight: 500;
}
/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.description-text {
  word-break: break-word;
  overflow-wrap: anywhere;
  width: full;
}

.clamped-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.description-text {
  white-space: pre-line;
}
.outlined-description {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-left: 4px solid #f4b400; /* mustard accent */
  border-radius: 10px;
  padding: 10px 14px;
  background: #fffdf5;
}
</style>
