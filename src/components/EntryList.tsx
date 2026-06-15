import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { EntryItem } from "./EntryItem";
import { useT } from "../lib/i18n";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

type SharedHandlers = {
  settings: Settings;
  onUpdate: (id: number, content: string, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onPin: (id: number, pinned: boolean) => Promise<void>;
  onReorder: (orderedIds: number[]) => Promise<void>;
};

type Props = SharedHandlers & {
  entries: Entry[];
  searchActive?: boolean;
  highlightQuery?: string;
};

// One pin-group rendered as an independent drag zone. Two separate
// DndContexts (pinned / others) make cross-section dragging impossible by
// construction — matches the "pinned section stays on top" semantics.
function SortableSection({
  items,
  settings,
  dndDisabled,
  highlightQuery,
  onUpdate,
  onDelete,
  onPin,
  onReorder,
}: SharedHandlers & {
  items: Entry[];
  dndDisabled?: boolean;
  highlightQuery?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = items.map((x) => x.id);
    const oldIndex = ids.indexOf(active.id as number);
    const newIndex = ids.indexOf(over.id as number);
    if (oldIndex < 0 || newIndex < 0) return;
    void onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((x) => x.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((e) => (
          <EntryItem
            key={e.id}
            entry={e}
            settings={settings}
            dndDisabled={dndDisabled}
            highlightQuery={highlightQuery}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onPin={onPin}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export function EntryList({ entries, searchActive, ...handlers }: Props) {
  const t = useT();
  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <div className="entry-list-empty">
          {searchActive ? t("search.noResults") : t("list.empty")}
        </div>
      </div>
    );
  }

  const pinned = entries.filter((e) => e.pinned);
  const others = entries.filter((e) => !e.pinned);
  // Filtering reorders nothing, but a drag over a filtered subset would
  // rewrite sort_order for the wrong neighbours — disable dnd while searching.
  const dndDisabled = !!searchActive;

  return (
    <div className="entry-list">
      {pinned.length > 0 && (
        <>
          <div className="entry-section-label">{t("list.pinnedSection")}</div>
          <SortableSection items={pinned} dndDisabled={dndDisabled} {...handlers} />
          {others.length > 0 && (
            <div className="entry-section-label">{t("list.otherSection")}</div>
          )}
        </>
      )}
      <SortableSection items={others} dndDisabled={dndDisabled} {...handlers} />
    </div>
  );
}
