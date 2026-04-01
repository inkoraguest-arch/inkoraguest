import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './CalendarManager.css';

export function CalendarManager({ artistId, isOwner, onSelectSlot }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Form for new slot
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    useEffect(() => {
        if (artistId) {
            fetchSlots();
        }
    }, [artistId]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('availability_slots')
                .select('*')
                .eq('artist_id', artistId)
                .order('slot_date', { ascending: true })
                .order('slot_time', { ascending: true });

            if (data) setSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        if (!newDate || !newTime) return;
        setAdding(true);
        try {
            const { data, error } = await supabase
                .from('availability_slots')
                .insert([{
                    artist_id: artistId,
                    slot_date: newDate,
                    slot_time: newTime,
                    status: 'available'
                }])
                .select()
                .single();

            if (data) {
                setSlots(prev => [...prev, data].sort((a, b) => a.slot_date.localeCompare(b.slot_date)));
                setNewDate('');
                setNewTime('');
            }
        } catch (error) {
            console.error('Error adding slot:', error);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSlot = async (id) => {
        try {
            const { error } = await supabase
                .from('availability_slots')
                .delete()
                .eq('id', id);

            if (!error) {
                setSlots(prev => prev.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Error deleting slot:', error);
        }
    };

    const handleSelectSlot = (slot) => {
        if (isOwner) return;
        setSelectedSlotId(slot.id);
        if (onSelectSlot) onSelectSlot(slot);
    };

    if (loading) return <div className="calendar-loading"><Loader className="spin" /></div>;

    return (
        <div className="calendar-manager">
            <div className="calendar-header">
                <Calendar size={18} />
                <h3>Vagas Disponíveis</h3>
            </div>

            {isOwner && (
                <div className="add-slot-form">
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="slot-input"
                    />
                    <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="slot-input"
                    />
                    <button
                        onClick={handleAddSlot}
                        disabled={adding || !newDate || !newTime}
                        className="add-slot-btn"
                    >
                        {adding ? <Loader className="spin" size={16} /> : <Plus size={16} />}
                        <span>Adicionar</span>
                    </button>
                </div>
            )}

            <div className="slots-grid">
                {slots.length > 0 ? (
                    slots.map(slot => (
                        <div
                            key={slot.id}
                            className={`slot-card ${slot.status} ${selectedSlotId === slot.id ? 'selected' : ''} ${!isOwner ? 'clickable' : ''}`}
                            onClick={() => handleSelectSlot(slot)}
                        >
                            <div className="slot-info">
                                <span className="slot-date">
                                    {new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </span>
                                <span className="slot-separator">•</span>
                                <span className="slot-time">
                                    <Clock size={12} />
                                    {slot.slot_time}
                                </span>
                            </div>

                            {isOwner ? (
                                <button className="delete-slot-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}>
                                    <Trash2 size={14} />
                                </button>
                            ) : (
                                selectedSlotId === slot.id && <CheckCircle size={16} className="selected-icon" />
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-slots">Nenhuma vaga cadastrada para as próximas semanas.</p>
                )}
            </div>
        </div>
    );
}
