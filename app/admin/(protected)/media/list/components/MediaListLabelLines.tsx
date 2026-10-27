"use client";

import { useState, type ReactNode } from "react";
import MediaPeoplePicker from "../../components/MediaPeoplePicker";
import TagMultiSelect from "../../components/TagMultiSelect";
import type { LabelLine, MediaListLabels } from "../lib/useMediaListLabels";
import { EditLineButton } from "./EditLineButton";
import { MediaListLabelEditor } from "./MediaListLabelEditor";
import { MediaListPeople } from "./MediaListPeople";
import { MediaListTags } from "./MediaListTags";
import type { MediaItem } from "./MediaListItem";

export function MediaListLabelLines({
  item,
  labels,
  disabled,
}: {
  item: MediaItem;
  labels: MediaListLabels;
  disabled: boolean;
}) {
  const [lastOpened, setLastOpened] = useState<LabelLine | null>(null);
  const open = labels.draft?.id === item.id ? labels.draft : null;

  function pencil(line: LabelLine, label: string) {
    return (
      <EditLineButton
        label={label}
        disabled={disabled || Boolean(labels.draft)}
        focusOnMount={lastOpened === line}
        onClick={() => {
          setLastOpened(line);
          labels.open(item, line);
        }}
      />
    );
  }

  function editor(children: ReactNode) {
    return (
      <MediaListLabelEditor busy={labels.busy} dirty={labels.dirty} onCancel={labels.cancel} onSave={() => void labels.save()}>
        {children}
      </MediaListLabelEditor>
    );
  }

  return (
    <>
      {open?.line === "people" ? (
        editor(
          <MediaPeoplePicker
            selectedPeopleIds={open.peopleIds}
            selectedPeopleNames={open.people}
            setSelectedPeople={labels.setPeople}
          />
        )
      ) : (
        <MediaListPeople ids={item.peopleIds} names={item.people} action={pencil("people", "Edit people")} />
      )}

      {open?.line === "tags" ? (
        editor(<TagMultiSelect selectedSlugs={open.tags} addTag={labels.addTag} removeTag={labels.removeTag} />)
      ) : (
        <MediaListTags tags={item.tags} action={pencil("tags", "Edit tags")} />
      )}
    </>
  );
}
