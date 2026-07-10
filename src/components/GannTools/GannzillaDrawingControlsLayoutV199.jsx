import React from 'react';

const LINE_CONTROL_ID = 'gannzilla-line-control-v185';
const SHAPE_CONTROL_ID = 'gannzilla-shape-control-v185';
const LINE_MENU_ID = 'gannzilla-line-menu-v185';
const SHAPE_MENU_ID = 'gannzilla-shape-menu-v185';

export default function GannzillaDrawingControlsLayoutV199() {
  return (
    <style>{`
      #${LINE_CONTROL_ID} {
        width: 30px !important;
        min-width: 30px !important;
        transform: translateX(-26px) !important;
        pointer-events: auto !important;
      }

      #${SHAPE_CONTROL_ID} {
        width: 30px !important;
        min-width: 30px !important;
        transform: translateX(-12px) !important;
        pointer-events: auto !important;
      }

      #${LINE_MENU_ID} {
        transform: translateX(-26px) !important;
        pointer-events: auto !important;
      }

      #${SHAPE_MENU_ID} {
        transform: translateX(-12px) !important;
        pointer-events: auto !important;
      }
    `}</style>
  );
}
