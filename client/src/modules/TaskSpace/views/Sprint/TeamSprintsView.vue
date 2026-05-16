<template>
  <div class="flex flex-col pl-8 pr-8 py-8 gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1
          style="
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: -0.03em;
            color: var(--ink-primary);
            line-height: 1;
            margin: 0;
          "
        >
          Sprints
        </h1>
        <p
          style="
            font-size: 0.75rem;
            margin-top: 6px;
            color: var(--ink-muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          "
        >
          Plan and track your team's work
        </p>
      </div>
      <Button
        label="+ Create Sprint"
        style="font-weight: 800"
        @click="openCreateDialog"
      />
    </div>

    <div
      v-if="isLoading"
      style="display: flex; justify-content: center; padding: 5rem 0"
    >
      <i
        class="pi pi-spinner pi-spin"
        style="font-size: 1.5rem; color: var(--ink-muted)"
      />
    </div>

    <div
      v-else-if="error"
      style="
        color: var(--danger);
        font-weight: 700;
        padding: 1rem;
        border: 2px solid var(--danger);
        background: var(--danger-soft);
      "
    >
      Failed to load sprints.
    </div>

    <div
      v-else-if="sprints.length === 0"
      style="
        border: 2px dashed var(--ink-primary);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        gap: 12px;
        text-align: center;
      "
    >
      <i
        class="pi pi-calendar"
        style="font-size: 2rem; color: var(--ink-muted)"
      />
      <p
        style="
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--ink-secondary);
          margin: 0;
        "
      >
        No sprints yet
      </p>
      <p
        style="
          font-size: 0.75rem;
          color: var(--ink-muted);
          margin: 0;
          font-weight: 500;
        "
      >
        Create a sprint to start planning your team's work
      </p>
      <Button
        label="+ Create Sprint"
        style="font-weight: 800; margin-top: 8px"
        @click="openCreateDialog"
      />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="sprint in sprints"
        :key="sprint._id"
        class="group cursor-pointer transition-all duration-100"
        style="
          background: var(--card-bg);
          border: 2px solid var(--ink-primary);
          box-shadow: 4px 4px 0 var(--ink-primary);
          padding: 1.25rem;
        "
        @mouseenter="
          ($event.currentTarget as HTMLElement).style.transform =
            'translate(-2px,-2px)';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            '6px 6px 0 var(--ink-primary)';
        "
        @mouseleave="
          ($event.currentTarget as HTMLElement).style.transform = 'none';
          ($event.currentTarget as HTMLElement).style.boxShadow =
            '4px 4px 0 var(--ink-primary)';
        "
        @click="goToSprint(sprint._id)"
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          "
        >
          <div style="flex: 1; min-width: 0">
            <p
              style="
                font-size: 1rem;
                font-weight: 800;
                color: var(--ink-primary);
                margin: 0 0 4px;
                letter-spacing: -0.02em;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ sprint.name }}
            </p>
            <p
              style="
                font-size: 0.7rem;
                color: var(--ink-muted);
                margin: 0 0 10px;
                font-weight: 600;
              "
            >
              {{ formatDate(sprint.startDate) }} —
              {{ formatDate(sprint.endDate) }}
            </p>
            <span
              :style="{
                fontSize: '0.65rem',
                fontWeight: '800',
                padding: '3px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: '1.5px solid currentColor',
                color:
                  sprint.status === 'active'
                    ? 'var(--success)'
                    : sprint.status === 'completed'
                      ? 'var(--ink-muted)'
                      : 'var(--xp)',
                background:
                  sprint.status === 'active'
                    ? 'var(--success-soft)'
                    : sprint.status === 'completed'
                      ? 'var(--surface-muted)'
                      : 'var(--xp-soft)',
              }"
            >
              {{ sprint.status }}
            </span>
          </div>
          <div style="display: flex; gap: 4px; flex-shrink: 0">
            <button
              style="
                width: 28px;
                height: 28px;
                background: #fff;
                border: 2px solid var(--ink-primary);
                box-shadow: 2px 2px 0 var(--ink-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 80ms ease;
              "
              @mouseenter="
                ($event.currentTarget as HTMLElement).style.transform =
                  'translate(1px,1px)';
                ($event.currentTarget as HTMLElement).style.boxShadow =
                  '1px 1px 0 var(--ink-primary)';
              "
              @mouseleave="
                ($event.currentTarget as HTMLElement).style.transform = 'none';
                ($event.currentTarget as HTMLElement).style.boxShadow =
                  '2px 2px 0 var(--ink-primary)';
              "
              @click.stop="openEditDialog(sprint)"
            >
              <i
                class="pi pi-pencil"
                style="font-size: 0.7rem; color: var(--ink-primary)"
              />
            </button>
            <button
              style="
                width: 28px;
                height: 28px;
                background: var(--danger-soft);
                border: 2px solid var(--danger);
                box-shadow: 2px 2px 0 var(--danger);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 80ms ease;
              "
              @mouseenter="
                ($event.currentTarget as HTMLElement).style.transform =
                  'translate(1px,1px)';
                ($event.currentTarget as HTMLElement).style.boxShadow =
                  '1px 1px 0 var(--danger)';
              "
              @mouseleave="
                ($event.currentTarget as HTMLElement).style.transform = 'none';
                ($event.currentTarget as HTMLElement).style.boxShadow =
                  '2px 2px 0 var(--danger)';
              "
              @click.stop="confirmDelete(sprint)"
            >
              <i
                class="pi pi-trash"
                style="font-size: 0.7rem; color: var(--danger)"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <CreateSprintDialog
      v-model="showDialog"
      :sprint="editingSprint"
      @save="handleSaveSprint"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useSprintManager } from "./sprint.composable";
import Button from "primevue/button";
import CreateSprintDialog from "./CreateSprintDialog.vue";

const route = useRoute();
const teamId = route.params.teamId as string;

const {
  sprints,
  isLoading,
  error,
  showDialog,
  editingSprint,
  openCreateDialog,
  openEditDialog,
  handleSaveSprint,
  confirmDelete,
  goToSprint,
} = useSprintManager(teamId);

const formatDate = (date: string | Date) => new Date(date).toLocaleDateString();
</script>
