import React from 'react';

// Build 157: double the canonical Gannzilla About dialog while keeping it responsive.
export default function GannzillaAboutDialogScaleV157() {
  return (
    <style>{`
      #gannzilla-about-dialog-v156 > div {
        width: min(476px, calc(100vw - 24px)) !important;
        min-height: min(640px, calc(100vh - 24px)) !important;
        max-height: calc(100vh - 24px) !important;
        overflow: auto !important;
      }

      #gannzilla-about-dialog-v156 > div > div:first-child {
        height: 64px !important;
        padding: 0 16px !important;
        font-size: 26px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:first-child button {
        width: 56px !important;
        height: 56px !important;
        font-size: 40px !important;
        line-height: 48px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) {
        padding: 36px 36px 24px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > div:first-child {
        transform: scale(2);
        transform-origin: center;
        margin-top: 22px !important;
        margin-bottom: 42px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > div:nth-child(2) {
        font-size: 30px !important;
        margin-bottom: 36px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > div:nth-child(n+3),
      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > a {
        font-size: 24px !important;
        line-height: 1.55 !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > div:nth-child(7) {
        margin-top: 48px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > div:nth-child(9) {
        margin-top: 38px !important;
      }

      #gannzilla-about-dialog-v156 > div > div:nth-child(2) > div:nth-child(9) button {
        min-width: 116px !important;
        height: 50px !important;
        font-size: 22px !important;
      }

      @media (max-height: 680px) {
        #gannzilla-about-dialog-v156 > div {
          min-height: calc(100vh - 16px) !important;
          max-height: calc(100vh - 16px) !important;
        }
      }
    `}</style>
  );
}
