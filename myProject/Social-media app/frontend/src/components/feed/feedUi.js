// src/feed/feedUi.js

export const feedCustomCss = `
:root {
  --primary-color: #fc006d;
}
  * {
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }
  @keyframes heartPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); color: #ff2a6d; filter: drop-shadow(0 0 12px #ff2a6d); }
    100% { transform: scale(1); }
  }
  .like-burst { animation: heartPop 0.5s ease-in-out !important; }

  @keyframes rippleFeedback {
    0% { opacity: 0.9; transform: scale(0.85); }
    100% { opacity: 0; transform: scale(1.4); }
  }
  .ripple-anim { animation: rippleFeedback 0.65s ease-out forwards; }

  .youtube-player-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    max-height: 70vh;
  }

  .custom-controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  .controls-group-left, .controls-group-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @media (min-width: 769px) {
    .youtube-player-frame {
      border-radius: 8px;
      max-height: 560px;
    }
    .cyber-card { transition: all 0.25s ease; }
    .cyber-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(56, 53, 219, 0.61) !important;
    }
  }

  @media (max-width: 768px) {
    .feed-page-wrapper {
      padding: 8px 8px 90px !important;
    }
    .expanded-section-mobile {
      margin-left: -8px !important;
      margin-right: -8px !important;
      width: calc(100% + 16px) !important;
      border-left: none !important;
      border-right: none !important;
      border-radius: 0 !important;
    }
    .youtube-player-frame {
      border-radius: 0 !important;
      aspect-ratio: 16 / 9 !important;
      min-height: 200px;
    }
    .custom-controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: space-between;
    }
    .controls-group-left { gap: 4px; }
    .controls-group-right { gap: 4px; }
    .time-counter-mobile {
      font-size: 10px !important;
      margin-left: 2px !important;
    }
    .subtitles-mobile {
      bottom: 74px !important;
      max-width: 94% !important;
    }
    .subtitle-text-mobile {
      font-size: 12px !important;
      padding: 3px 8px !important;
    }
    .videos-grid-mobile {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
  }

  @media (max-width: 480px) {
    .seek-btn-mobile { display: none !important; }
    .time-counter-mobile { font-size: 9px !important; }
  }

  input[type="range"].mx-thick-seekbar {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
  }
  input[type="range"].mx-thick-seekbar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 4px;
    height: 14px;
    border-radius: %;
    background: #32f00300;
    box-shadow: 0 0 10px #352c2c03, 0 0 3px #c25e9804;
    cursor: pointer;
  }

  .reels-scroll-container {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .reels-scroll-container::-webkit-scrollbar { display: none; }
  .reel-snap-item {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #9d0404;
  }
`;

export const styles = {
  pageWrapper: {
    minHeight: "100vh",
    padding: "12px 14px 85px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: { maxWidth: "1280px", margin: "0 auto" },
  searchBanner: {
    maxWidth: "1280px",
    margin: "0 auto 12px",
    padding: "8px 12px",
    border: "1px solid rgba(0, 243, 255, 0.25)",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
  },
  clearSearchBtn: {
    background: "transparent",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "10px",
    cursor: "pointer",
  },
  sectionHeader: {
    fontSize: "13px",
    letterSpacing: "1px",
    margin: "0 0 10px",
    textTransform: "uppercase",
  },
  emptyNote: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px dashed #1e2638",
    color: "#5f718a",
    fontSize: "12px",
    textAlign: "center",
  },
  shortsGrid: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "10px",
    WebkitOverflowScrolling: "touch",
  },
  shortCard: {
    minWidth: "125px",
    maxWidth: "135px",
    height: "215px",
    backgroundColor: "#0e121c",
    borderRadius: "10px",
    border: "1px solid #1a2235",
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    flexShrink: 0,
  },
  shortThumbnail: { width: "100%", height: "100%", objectFit: "cover" },
  shortOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
    padding: "6px 8px",
    boxSizing: "border-box",
  },
  shortBadge: {
    fontSize: "9px",
    background: "#ff2a6d",
    color: "#fff",
    padding: "2px 5px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  shortTitle: {
    margin: "3px 0 1px",
    fontSize: "11px",
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  videosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px",
  },
  videoCard: {
    borderRadius: "10px",
    border: "1px solid",
    overflow: "hidden",
    cursor: "pointer",
  },
  videoThumbWrapper: {
    position: "relative",
    aspectRatio: "16 / 9",
    backgroundColor: "#000",
  },
  videoThumb: { width: "100%", height: "100%", objectFit: "cover" },
  playIconOverlay: {
    position: "absolute",
    top: "49%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "36px",
    height: "36px",
    background: "rgba(39, 50, 51, 0.85)",
    color: "#13d613",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },
  videoCardTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  expandedSection: {
    // position: "sticky",
    width: "100%",
    // borderRadius: "8px",
    marginBottom: "20px",
    overflow: "hidden",
    boxShadow: "0 0 20px rgba(0, 243, 255, 0.25)",
  },
  expandedHeader: {
    // position: "absolute",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
  },
  closeBtn: {
    background: "none",
    border: "1px solid #ff2a6d",
    color: "#ff2a6d",
    padding: "3px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },
  youtubeFullVideo: { width: "100%", height: "100%", objectFit: "contain" },
  subtitlesBox: {
    position: "absolute",
    bottom: "55px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 25,
    pointerEvents: "none",
    maxWidth: "90%",
    textAlign: "center",
  },
  subtitleText: {
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    color: "#00f3ff",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    border: "1px solid rgba(43, 215, 224, 0.5)",
    boxShadow: "0 0 14px rgba(0, 0, 0, 0.95)",
    display: "inline-block",
    textShadow: "0 0 4px #000",
  },
  hasSubBadge: {
    fontSize: "10px",
    color: "#05ffa1",
    background: "rgba(5, 255, 161, 0.12)",
    padding: "1px 6px",
    borderRadius: "4px",
  },
  touchZonesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    zIndex: 10,
  },
  touchHalfZone: {
    flex: 1,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  doubleTapIndicator: {
    backgroundColor: "rgba(0, 243, 255, 0.25)",
    border: "2px solid #00f3ff",
    borderRadius: "50%",
    width: "68px",
    height: "68px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 0 20px #00f3ff",
    pointerEvents: "none",
  },
  centerPausedOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 12,
    pointerEvents: "none",
  },
  largePlayPulse: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "rgba(49, 49, 48, 0.63)",
    color: "#50ce37",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    paddingLeft: "5px",
    paddingBottom: "2px",
    boxShadow: "0 0 18px #1f2121bb",
  },
  customControlsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background:
      "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4) 70%, transparent)",
    padding: "8px 10px 8px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    transition: "opacity 0.25s ease",
    zIndex: 20,
  },
  seekbarContainer: { width: "100%", display: "flex", alignItems: "center" },
  playBtn: {
    background: "#fc006d",
    border: "none",
    color: "#f3efef",
    width: "40px",
    height: "40px",
    paddingRight: "5px",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  seekStepBtn: {
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#fff",
    padding: "7px 9px",
    padding: "7px",
    borderRadius: "4px",
    fontSize: "14px",
    marginLeft: "10px",
    fontWeight: "600",
    cursor: "pointer",
    flexShrink: 0,
  },
  timeCounter: {
    fontSize: "14px",
    marginLeft: "10px",
    color: "#cbd5e1",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  },
  speedSelect: {
    // background: "#18275244",
    // color: "var(--primary-color)",
    // border: "2px solid var(--primary-color)",
    background: "rgba(185, 179, 179, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#d4cfcf",
    borderRadius: "4px",
    fontSize: "14px",
    padding: "2px 3px",
    outline: "none",
    cursor: "pointer",
    fontWeight: "bold",
    padding: "10px",
    flexShrink: 0,
  },
  loadSubBtn: {
    background: "rgba(0, 243, 255, 0.1)",
    border: "1px dashed",
    padding: "2px 5px",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    flexShrink: 0,
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#fff",
    whiteSpace: "nowrap",
  },
  ccBtn: {
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#fff",
    border: "1px solid",
    padding: "2px 5px",
    borderRadius: "4px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    flexShrink: 0,
  },
  resolutionBadge: {
    fontSize: "8px",
    background: "var(--primary-color)",
    border: "1px solid var(--primary-color)",
    padding: "1px 3px",
    padding: "10px",
    fontSize: "12px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  fullscreenBtn: {
    background: "transparent",
    border: "none",
    color: "#ae2d8edc",
    padding: "10px",
    fontSize: "40px",
    marginLeft: "10px",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  actionToolbar: { display: "flex", gap: "8px", margin: "10px 0" },
  actionBtn: {
    border: "1px solid #222c3f",
    padding: "5px 12px",
    borderRadius: "16px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  commentBox: { border: "1px solid", borderRadius: "8px", padding: "10px" },
  commentInput: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "6px",
    outline: "none",
    fontSize: "12px",
    border: "1px solid",
  },
  sendCommentBtn: {
    background: "#00f3ff",
    border: "none",
    color: "#183cde",
    fontWeight: "bold",
    padding: "0 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
  },
  fullscreenModal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  shortScrollContainer: {
    width: "100%",
    maxWidth: "420px",
    height: "100vh",
    position: "relative",
  },
  zoomlessVideo: { width: "100%", height: "100%", objectFit: "contain" },
  shortCloseBtn: {
    position: "fixed",
    top: "14px",
    left: "14px",
    background: "rgba(0,0,0,0.6)",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 100000,
  },
  shortsFloatingActions: {
    position: "absolute",
    right: "12px",
    bottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center",
    zIndex: 10,
  },
  floatingActionItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  floatingBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(20, 25, 38, 0.75)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  actionCount: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "#fff",
    marginTop: "3px",
  },
  shortBottomMeta: {
    position: "absolute",
    bottom: "20px",
    left: "14px",
    right: "65px",
    zIndex: 10,
    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
    padding: "6px",
    borderRadius: "6px",
  },
  avatarLarge: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#00f3ff",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "bold",
  },
  loginLinkBtn: {
    padding: "6px 12px",
    border: "1px solid #222c3f",
    color: "#00f3ff",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "11px",
    background: "#141926",
    fontWeight: "bold",
  },
  registerLinkBtn: {
    padding: "6px 12px",
    background: "#00f3ff",
    color: "#000",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
  },
  bottomNavWrapper: {
    position: "fixed",
    bottom: "10px",
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "none",
  },
  bottomNavContainer: {
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 243, 255, 0.15)",
    borderRadius: "30px",
    padding: "4px 8px",
    width: "calc(100% - 20px)",
    maxWidth: "390px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  bottomNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    flex: 1,
  },
  uploadCenterBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #00f3ff 0%, #0077b6 100%)",
    border: "none",
    color: "#000",
    fontSize: "20px",
    fontWeight: "900",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 0 16px rgba(0, 243, 255, 0.5)",
    margin: "0 2px",
    transform: "translateY(-3px)",
  },
  centerBox: {
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cyberLoader: {
    width: "36px",
    height: "36px",
    border: "3px solid #1a2233",
    borderTop: "3px solid #00f3ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
