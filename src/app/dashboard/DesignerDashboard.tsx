"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Home, Calendar, Armchair, ChevronLeft, ChevronRight, CheckCircle, Circle, Trash2, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useDesign, Design, RoomData } from "@/lib/design-context";
import { DesignRequest } from "@/types/design";

export interface Todo {
  id: string;
  userId: string;
  date: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function DesignerDashboard() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { setCurrentDesign } = useDesign();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  
  const [incomingRequests, setIncomingRequests] = useState<DesignRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestRoomIndices, setRequestRoomIndices] = useState<Record<string, number>>({});

  // Calendar & Todo State
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    async function fetchDesigns() {
      if (!user) {
        setLoadingDesigns(false);
        return;
      }

      try {
        const q = query(
          collection(db, "designs"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedDesigns: Design[] = [];
        querySnapshot.forEach((doc) => {
          fetchedDesigns.push({ id: doc.id, ...doc.data() } as Design);
        });

        // Sort manually by updatedAt descending since we didn't add a composite index yet
        fetchedDesigns.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        setDesigns(fetchedDesigns);
      } catch (error) {
        console.error("Error fetching designs:", error);
      } finally {
        setLoadingDesigns(false);
      }
    }

    fetchDesigns();
  }, [user]);

  // Fetch Incoming Requests
  useEffect(() => {
    if (!user) {
      setLoadingRequests(false);
      return;
    }

    const q = query(
      collection(db, "design_requests"),
      where("designerId", "==", user.uid)
    );
    
    // Sort client-side mostly
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: DesignRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as DesignRequest;
        if (data.status !== "completed") {
          fetchedRequests.push({ ...data, id: doc.id });
        }
      });
      fetchedRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIncomingRequests(fetchedRequests);
      setLoadingRequests(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Todos Real-time
  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }
    const q = query(
      collection(db, "todos"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTodos: Todo[] = [];
      snapshot.forEach((doc) => {
        fetchedTodos.push({ id: doc.id, ...doc.data() } as Todo);
      });
      // Sort by creation time
      fetchedTodos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setTodos(fetchedTodos);
    });

    return () => unsubscribe();
  }, [user]);

  const formatTodoDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const selectedDateString = formatTodoDate(selectedDate);
  const todosForSelectedDate = todos.filter(t => t.date === selectedDateString);

  // Todo Handlers
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTodoText.trim()) return;

    try {
      await addDoc(collection(db, "todos"), {
        userId: user.uid,
        date: selectedDateString,
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      });
      setNewTodoText("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "todos", todo.id), {
        completed: !todo.completed
      });
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Calendar Logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Animation variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e1713]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-[#f3b5a1] border-white/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-x-hidden flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 backdrop-blur-md bg-black/20 border-b border-white/10 shadow-lg shadow-black/10"
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-3xl font-medium tracking-wide text-white hover:text-white/80 transition-colors cursor-pointer" style={{ fontFamily: "var(--font-italiana)" }}>
                Prism
              </Link>
              <div className="h-6 w-px bg-white/20 hidden md:block"></div>
              <span className="text-white/60 font-light tracking-wide text-sm hidden md:block">
                Designer Dashboard
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-0.5 hidden sm:flex">
                <span className="text-white/90 font-light text-sm">
                  {user?.displayName || user?.email?.split("@")[0]}
                </span>
                <span className="text-white/40 text-xs">
                  {user?.email}
                </span>
              </div>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex items-center gap-2"
                title="Home"
              >
                <Home className="w-4 h-4" />
                <span className="sr-only">Home</span>
              </Button>
              <Button
                onClick={() => router.push("/dashboard/settings")}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-[#f3b5a1]/80 hover:text-[#f3b5a1] hover:bg-[#f3b5a1]/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-12">
        {/* Top Metric Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {/* Card 1 */}
          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors duration-500"></div>
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">Total Designs</h2>
            <p className="text-5xl font-light text-white" style={{ fontFamily: "var(--font-italiana)" }}>
              {loadingDesigns ? "-" : designs.length}
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f3b5a1]/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#f3b5a1]/10 transition-colors duration-500"></div>
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">This Month</h2>
            <p className="text-5xl font-light text-white" style={{ fontFamily: "var(--font-italiana)" }}>
              {loadingDesigns ? "-" : designs.filter(d => new Date(d.updatedAt).getMonth() === new Date().getMonth()).length}
            </p>
          </motion.div>

          {/* Card 3 - Quick Action */}
          <motion.div variants={fadeUp} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-8 flex flex-col justify-between items-start relative overflow-hidden group">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Quick Action</h2>
            <Button
              onClick={() => {
                setCurrentDesign(null); // Clear context for a new design
                router.push("/design/new");
              }}
              className="w-full py-6 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-[15px] flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Plus className="w-5 h-5" /> New Design
            </Button>
          </motion.div>
        </motion.div>

        {/* Calendar & Todo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Calendar Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#8ea37e]/10 blur-2xl rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-medium tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNextMonth} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 relative z-10">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
                  {day}
                </div>
              ))}
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="aspect-square"></div>
              ))}
              {days.map(day => {
                const dateOfThisDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const dateStr = formatTodoDate(dateOfThisDay);
                const hasTodos = todos.some(t => t.date === dateStr);
                const isSelected = selectedDateString === dateStr;
                const isToday = formatTodoDate(new Date()) === dateStr;

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(dateOfThisDay)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl relative transition-colors ${isSelected
                      ? 'bg-white text-[#233529]'
                      : isToday
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {hasTodos && (
                      <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-[#233529]' : 'bg-[#f3b5a1]'}`}></span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Todo List Card */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden h-[450px]">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#f3b5a1]/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 relative z-10">
              <h3 className="text-2xl font-medium tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
                Tasks for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <span className="text-white/40 text-sm font-light">
                {todosForSelectedDate.filter(t => t.completed).length} / {todosForSelectedDate.length} completed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {todosForSelectedDate.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 font-light">
                  <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                  <p>No tasks for this day.</p>
                </div>
              ) : (
                todosForSelectedDate.map(todo => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                  >
                    <button
                      onClick={() => handleToggleTodo(todo)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      {todo.completed ? (
                        <CheckCircle className="w-5 h-5 text-[#8ea37e] shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/40 group-hover:text-white/60 shrink-0" />
                      )}
                      <span className={`text-[15px] font-light transition-all ${todo.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>
                        {todo.text}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Todo Input */}
            <form onSubmit={handleAddTodo} className="mt-6 relative z-10 flex gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Add a new task..."
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#f3b5a1]/50 focus:ring-[#f3b5a1]/20 rounded-xl h-12 pl-4 pr-4 font-light"
                />
              </div>
              <Button
                type="submit"
                disabled={!newTodoText.trim() || !user}
                className="h-12 w-12 rounded-xl bg-white text-[#233529] hover:bg-white/90 shrink-0 p-0 flex items-center justify-center shadow-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </form>

          </div>
        </motion.div>

        {/* Incoming Requests Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.3 }}
           className="w-full flex flex-col gap-6"
        >
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
             <h2 className="text-3xl font-medium tracking-wide text-amber-400" style={{ fontFamily: "var(--font-italiana)" }}>Incoming Requests</h2>
             <span className="text-white/40 text-sm font-light">{incomingRequests.filter(r => r.status === 'pending' || r.status === 'in_progress').length} active</span>
          </div>

          {loadingRequests ? (
            <div className="w-full h-[200px] flex items-center justify-center backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-2xl">
               <div className="w-8 h-8 border-2 border-amber-400/50 border-t-amber-400 rounded-full animate-spin"></div>
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="w-full h-[200px] flex flex-col items-center justify-center backdrop-blur-md bg-white/[0.02] border border-white/10 border-dashed rounded-2xl text-white/40">
               <p>No incoming requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map(request => (
                <div key={request.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                   {request.status === 'completed' && <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />}
                   
                   <div className="flex justify-between items-start mb-4 relative z-20">
                     <div>
                       <h3 className="text-lg font-medium tracking-wide text-white mb-1">
                         Client Request
                       </h3>
                       <p className="text-sm text-white/50">
                         {new Date(request.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                     <span className={`px-3 py-1 text-xs rounded-full border ${
                        request.status === 'completed' ? 'bg-[#8ea37e]/20 text-[#8ea37e] border-[#8ea37e]/30' :
                        request.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                     } capitalize`}>
                       {request.status.replace("_", " ")}
                     </span>
                   </div>
                   
                   {(() => {
                     const roomsList = request.rooms && request.rooms.length > 0 
                        ? request.rooms 
                        : (request.room ? [{ id: 'default', name: 'Main Room', room: request.room, furniture: [] } as RoomData] : []);
                     
                     if (roomsList.length === 0) return null;
                     
                     const roomIndex = requestRoomIndices[request.id] || 0;
                     const currentRoomData = roomsList[roomIndex];
                     const reqRoom = currentRoomData?.room;
                     
                     if (!reqRoom) return null;

                     return (
                       <div className="mb-6 relative z-20">
                         {roomsList.length > 1 && (
                           <div className="flex items-center justify-between mb-3 bg-black/10 rounded-lg p-1.5 px-3">
                             <button 
                               onClick={() => setRequestRoomIndices(prev => ({ ...prev, [request.id]: Math.max(0, roomIndex - 1) }))}
                               disabled={roomIndex === 0}
                               className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                             >
                               <ChevronLeft className="w-4 h-4 text-white/70" />
                             </button>
                             <span className="text-sm font-medium text-white/80">{currentRoomData.name || `Room ${roomIndex + 1}`}</span>
                             <button 
                               onClick={() => setRequestRoomIndices(prev => ({ ...prev, [request.id]: Math.min(roomsList.length - 1, roomIndex + 1) }))}
                               disabled={roomIndex === roomsList.length - 1}
                               className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                             >
                               <ChevronRight className="w-4 h-4 text-white/70" />
                             </button>
                           </div>
                         )}
                         <div className="grid grid-cols-3 gap-2">
                           <div className="bg-black/20 p-2 rounded-lg text-center">
                             <span className="block text-xs text-white/40 mb-1">Width</span>
                             <span className="text-sm text-white">{reqRoom.width}m</span>
                           </div>
                           <div className="bg-black/20 p-2 rounded-lg text-center">
                             <span className="block text-xs text-white/40 mb-1">Length</span>
                             <span className="text-sm text-white">{reqRoom.length}m</span>
                           </div>
                           <div className="bg-black/20 p-2 rounded-lg text-center">
                             <span className="block text-xs text-white/40 mb-1">Height</span>
                             <span className="text-sm text-white">{reqRoom.height}m</span>
                           </div>
                         </div>
                       </div>
                     );
                   })()}

                     <div className="relative z-20">
                     {request.status !== 'completed' ? (
                       <Button 
                         onClick={() => {
                           window.location.href = `/design/new?requestId=${request.id}`;
                         }}
                         className="w-full bg-[#f3b5a1] text-[#233529] hover:bg-[#f3b5a1]/90 rounded-xl font-medium"
                       >
                         {request.status === 'pending' ? 'Accept & Start Design' : 'Continue Design'}
                       </Button>
                     ) : (
                       <Button disabled variant="outline" className="w-full border-white/10 text-white/30 rounded-xl">
                         Completed
                       </Button>
                     )}
                   </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Portfolio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full flex flex-col gap-6"
        >
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <h2 className="text-3xl font-medium tracking-wide text-white" style={{ fontFamily: "var(--font-italiana)" }}>Design Portfolio</h2>
          </div>

          {loadingDesigns ? (
            <div className="w-full min-h-[400px] flex items-center justify-center backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : designs.length === 0 ? (
            <div className="w-full min-h-[400px] flex flex-col items-center justify-center backdrop-blur-md bg-white/[0.02] border border-white/10 border-dashed p-12 rounded-2xl">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <span className="text-4xl filter grayscale opacity-50">🛋️</span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-2" style={{ fontFamily: "var(--font-italiana)" }}>No designs yet</h3>
              <p className="text-white/50 font-light mb-8 max-w-sm text-center">
                Your stunning room designs will appear here. Create your first project to get started.
              </p>
              <Button
                onClick={() => {
                  setCurrentDesign(null);
                  router.push("/design/new");
                }}
                className="px-8 py-6 rounded-xl bg-transparent border border-white/20 text-white hover:bg-white hover:text-[#233529] transition-all font-medium tracking-wide text-[15px]"
              >
                Start Designing
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {designs.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${[
                        "bg-gradient-to-br from-pink-400 to-rose-500",
                        "bg-gradient-to-br from-purple-400 to-indigo-500",
                        "bg-gradient-to-br from-[#8ea37e] to-emerald-600",
                        "bg-gradient-to-br from-amber-400 to-orange-500",
                        "bg-gradient-to-br from-cyan-400 to-blue-500"
                      ][index % 5]
                        } transition-transform group-hover:scale-105 group-hover:rotate-3`}
                    >
                      <Armchair className="w-7 h-7 text-white opacity-90" />
                    </div>

                    <div className="flex flex-col">
                      <h3 className="text-xl font-medium text-white mb-1 tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
                        {design.name || "Untitled Design"}
                      </h3>
                      <p className="text-sm text-white/50 font-light flex items-center gap-4">
                        <span>{design.customerName ? `Client: ${design.customerName}` : "Personal Project"}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{design.furniture?.length || 0} items</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs text-white/40 uppercase tracking-wider font-medium mb-1">Last Updated</span>
                      <div className="flex items-center text-sm text-white/70 font-light">
                        <Calendar className="w-3.5 h-3.5 mr-2 opacity-50" />
                        {new Date(design.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentDesign(design);
                        router.push("/design/new");
                      }}
                      className="text-[#f3b5a1] hover:text-white hover:bg-[#f3b5a1]/20 px-6 h-10 rounded-xl"
                    >
                      Open
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}