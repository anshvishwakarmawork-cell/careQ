import React, { useEffect, useState } from "react";
import { useQueue } from "../../store/QueueStore";
import { ACTIONS } from "../../store/actions";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar as CalendarIcon, Clock, X } from "lucide-react";

export const PatientPopup = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();
  const [activePopup, setActivePopup] = useState(null);

  const { currentUser, notifications } = state;

  useEffect(() => {
    if (!currentUser) return;
    // We rely on currentUser.patientId to determine if it's a patient session

    // Find the first notification for this user that hasn't been "seen" as a popup
    const unshown = notifications.find(
      (n) => n.userId === currentUser.patientId && !n.popupSeen
    );

    if (unshown && !activePopup) {
      setActivePopup(unshown);
    } else if (!unshown && activePopup) {
      // If notifications state changed and it's marked seen, remove it
      const currentStillUnshown = notifications.find(
        (n) => n.id === activePopup.id && !n.popupSeen
      );
      if (!currentStillUnshown) {
        setActivePopup(null);
      }
    }
  }, [notifications, currentUser, activePopup]);

  if (!activePopup) return null;

  const handleDismiss = () => {
    dispatch({ type: ACTIONS.MARK_POPUP_SEEN, payload: { id: activePopup.id } });
  };

  const handleAction = () => {
    handleDismiss();
    if (activePopup.targetType === "QUEUE") {
      navigate(`/patient/token/${activePopup.targetId}`);
    } else {
      navigate(`/patient/visits`);
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl">
      <Card className="shadow-lg border-l-4 border-l-primary bg-white">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Bell size={18} />
              <span>{activePopup.title || "Notification"}</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
          
          <p className="text-sm text-navy mb-3 whitespace-pre-line leading-relaxed">
            {activePopup.message}
          </p>
          
          {(activePopup.oldDate || activePopup.newDate || activePopup.oldTime || activePopup.newTime) && (
            <div className="bg-slate-50 p-3 rounded-md text-sm mb-4 space-y-2">
              {(activePopup.oldDate || activePopup.oldTime) && (
                <div className="flex items-start gap-2 text-gray-500 line-through">
                  <CalendarIcon size={14} className="mt-0.5" />
                  <span>Previous: {activePopup.oldDate} {activePopup.oldTime && `• ${activePopup.oldTime}`}</span>
                </div>
              )}
              {(activePopup.newDate || activePopup.newTime) && (
                <div className="flex items-start gap-2 text-primary font-medium">
                  <Clock size={14} className="mt-0.5" />
                  <span>New: {activePopup.newDate} {activePopup.newTime && `• ${activePopup.newTime}`}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 text-sm py-2 h-auto" 
              onClick={handleAction}
            >
              {activePopup.targetType === "QUEUE" ? "View Live Queue" : "View Appointment"}
            </Button>
            <Button 
              className="flex-1 text-sm py-2 h-auto" 
              onClick={handleDismiss}
            >
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
