import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';
import { Input, Select, PrimaryButton, SecondaryButton } from '../components/shared/FormElements';

const emptyForm = { lead: '', company: '', date: '', time: '10:00', assignedTo: '', priority: 'Medium' };

export default function Calendar() {
  const { followUps, addFollowUp } = useData();
  const { teamMembers } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const events = followUps.map(fu => {
    const [year, month, day] = fu.date.split('-').map(Number);
    return { id: fu.id, title: `Call with ${fu.lead}`, date: new Date(year, month - 1, day), time: fu.time };
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const handleSave = () => {
    if (!form.lead.trim() || !form.date) return;
    addFollowUp({ ...form, status: 'Pending' });
    setModal(false);
    setForm(emptyForm);
  };

  return (
    <>
      <Card className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2 items-center">
            <PrimaryButton onClick={() => setModal(true)}>
              <Plus size={15} /> Add Reminder
            </PrimaryButton>
            <SecondaryButton onClick={prevMonth} className="!px-2.5">
              <ChevronLeft size={18} />
            </SecondaryButton>
            <SecondaryButton onClick={() => setCurrentDate(new Date())}>
              Today
            </SecondaryButton>
            <SecondaryButton onClick={nextMonth} className="!px-2.5">
              <ChevronRight size={18} />
            </SecondaryButton>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 border-r border-gray-200 last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6 auto-rows-fr">
          {Array.from({ length: 42 }).map((_, index) => {
            const dayNumber = index - firstDayOfMonth + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            let dayEvents = [];
            if (isCurrentMonth) {
              dayEvents = events.filter(e =>
                e.date.getDate() === dayNumber &&
                e.date.getMonth() === currentDate.getMonth() &&
                e.date.getFullYear() === currentDate.getFullYear()
              );
            }
            const isToday = isCurrentMonth &&
              dayNumber === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            if (index >= firstDayOfMonth + daysInMonth && index >= 35) return null;

            return (
              <div key={index} className={`min-h-[100px] border-r border-b border-gray-100 p-2 transition-colors ${!isCurrentMonth ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>
                {isCurrentMonth && (
                  <>
                    <div className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                      {dayNumber}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {dayEvents.map(event => (
                        <div key={event.id} className="text-xs p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 truncate cursor-pointer hover:bg-blue-100 transition-colors" title={event.title}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock size={10} />
                            <span className="font-semibold">{event.time}</span>
                          </div>
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add Reminder Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(emptyForm); }} title="Add Reminder" size="md">
        <div className="space-y-4">
          <Input label="Lead Name" value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })} placeholder="Enter lead name" />
          <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Enter company name" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <Select label="Assign To" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Select member</option>
            {teamMembers.map(m => <option key={m.id}>{m.name}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </Select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton onClick={() => { setModal(false); setForm(emptyForm); }}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}><Plus size={14} /> Add Reminder</PrimaryButton>
        </div>
      </Modal>
    </>
  );
}
