import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'technician';
export type JobCategory = 'plumbing' | 'electrical' | 'appliance' | 'ac';
export type JobUrgency = 'today' | 'this_week';
export type JobStatus = 'posted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface TechnicianProfile {
  id: string;
  name: string;
  services: JobCategory[];
  serviceRadiusKm: number;
  rating: number;
  completedJobs: number;
  bio: string;
  pricePerHour: number;
  isDemo?: boolean;
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  category: JobCategory;
  description: string;
  address: string;
  urgency: JobUrgency;
  status: JobStatus;
  priceEstimate: number;
  createdAt: string;
  technicianId?: string;
  technicianName?: string;
  acceptedAt?: string;
  completedAt?: string;
  rating?: number;
  ratingComment?: string;
  isDemo?: boolean;
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string;
}

interface AppContextType {
  user: User | null;
  jobs: Job[];
  technicianProfiles: TechnicianProfile[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  setUser: (user: User) => Promise<void>;
  createJob: (data: {
    category: JobCategory;
    description: string;
    address: string;
    urgency: JobUrgency;
  }) => Promise<Job>;
  acceptJob: (jobId: string) => Promise<void>;
  declineJob: (jobId: string) => Promise<void>;
  completeJob: (jobId: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  sendMessage: (jobId: string, text: string) => Promise<void>;
  rateJob: (jobId: string, rating: number, comment: string) => Promise<void>;
  signOut: () => Promise<void>;
  getJobMessages: (jobId: string) => Message[];
}

const KEYS = {
  USER: 'fixit_user',
  JOBS: 'fixit_jobs',
  MESSAGES: 'fixit_messages',
};

const DEMO_TECHS: TechnicianProfile[] = [
  {
    id: 'tech_demo_1',
    name: 'Marcus Williams',
    services: ['plumbing'],
    serviceRadiusKm: 15,
    rating: 4.9,
    completedJobs: 87,
    bio: 'Licensed master plumber with 12 years experience. Available same-day for emergencies.',
    pricePerHour: 95,
    isDemo: true,
  },
  {
    id: 'tech_demo_2',
    name: 'Sarah Chen',
    services: ['electrical'],
    serviceRadiusKm: 20,
    rating: 4.8,
    completedJobs: 52,
    bio: 'Certified electrician specializing in residential wiring and panel upgrades.',
    pricePerHour: 110,
    isDemo: true,
  },
  {
    id: 'tech_demo_3',
    name: 'David Rodriguez',
    services: ['appliance', 'plumbing'],
    serviceRadiusKm: 10,
    rating: 4.7,
    completedJobs: 134,
    bio: 'Expert in all major home appliances. Quick diagnosis, transparent pricing.',
    pricePerHour: 80,
    isDemo: true,
  },
  {
    id: 'tech_demo_4',
    name: 'James Thompson',
    services: ['ac'],
    serviceRadiusKm: 25,
    rating: 4.9,
    completedJobs: 43,
    bio: 'HVAC certified technician. AC installation, repair, and maintenance.',
    pricePerHour: 120,
    isDemo: true,
  },
];

const DEMO_JOBS: Job[] = [
  {
    id: 'job_demo_1',
    customerId: 'cust_demo_1',
    customerName: 'Alex Turner',
    category: 'plumbing',
    description: 'Leaking pipe under the kitchen sink. Water pooling in the cabinet. Needs urgent fix before it causes more damage.',
    address: '142 Oak Street, Downtown',
    urgency: 'today',
    status: 'posted',
    priceEstimate: 120,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isDemo: true,
  },
  {
    id: 'job_demo_2',
    customerId: 'cust_demo_2',
    customerName: 'Emma Blackwood',
    category: 'electrical',
    description: 'Power outlet in master bedroom stopped working. Tried resetting circuit breaker but no luck.',
    address: '78 Maple Avenue, Westside',
    urgency: 'this_week',
    status: 'posted',
    priceEstimate: 140,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
  {
    id: 'job_demo_3',
    customerId: 'cust_demo_3',
    customerName: 'Michael Park',
    category: 'appliance',
    description: 'Dishwasher not draining properly. Standing water at the bottom after each cycle.',
    address: '305 Birch Lane, Northgate',
    urgency: 'today',
    status: 'posted',
    priceEstimate: 90,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
];

const PRICE_BY_CATEGORY: Record<JobCategory, number> = {
  plumbing: 120,
  electrical: 140,
  appliance: 90,
  ac: 160,
};

const genId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicianProfiles] = useState<TechnicianProfile[]>(DEMO_TECHS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userStr, jobsStr, messagesStr] = await Promise.all([
          AsyncStorage.getItem(KEYS.USER),
          AsyncStorage.getItem(KEYS.JOBS),
          AsyncStorage.getItem(KEYS.MESSAGES),
        ]);

        if (userStr) setUserState(JSON.parse(userStr));

        const storedJobs: Job[] = jobsStr ? JSON.parse(jobsStr) : [];
        const storedDemoIds = new Set(storedJobs.filter(j => j.isDemo).map(j => j.id));
        const freshDemoJobs = DEMO_JOBS.filter(dj => !storedDemoIds.has(dj.id));
        setJobs([...storedJobs.filter(j => !j.isDemo), ...freshDemoJobs, ...storedJobs.filter(j => j.isDemo)]);

        if (messagesStr) setMessages(JSON.parse(messagesStr));
      } catch {
        // continue
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persistJobs = async (newJobs: Job[]) => {
    await AsyncStorage.setItem(KEYS.JOBS, JSON.stringify(newJobs));
  };

  const persistMessages = async (newMessages: Record<string, Message[]>) => {
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(newMessages));
  };

  const setUser = useCallback(async (newUser: User) => {
    setUserState(newUser);
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(newUser));
  }, []);

  const createJob = useCallback(
    async (data: { category: JobCategory; description: string; address: string; urgency: JobUrgency }) => {
      if (!user) throw new Error('Not logged in');
      const newJob: Job = {
        id: genId(),
        customerId: user.id,
        customerName: user.name,
        category: data.category,
        description: data.description,
        address: data.address,
        urgency: data.urgency,
        status: 'posted',
        priceEstimate: PRICE_BY_CATEGORY[data.category],
        createdAt: new Date().toISOString(),
      };
      const newJobs = [newJob, ...jobs];
      setJobs(newJobs);
      await persistJobs(newJobs);
      return newJob;
    },
    [user, jobs],
  );

  const acceptJob = useCallback(
    async (jobId: string) => {
      if (!user) return;
      const job = jobs.find(j => j.id === jobId);
      const updatedJobs = jobs.map(j =>
        j.id === jobId
          ? { ...j, status: 'accepted' as JobStatus, technicianId: user.id, technicianName: user.name, acceptedAt: new Date().toISOString() }
          : j,
      );
      setJobs(updatedJobs);
      await persistJobs(updatedJobs);

      if (job) {
        const initMsg: Message = {
          id: genId(),
          jobId,
          senderId: user.id,
          senderName: user.name,
          text: `Hi ${job.customerName}! I've accepted your job. I'll arrive within the hour. Could you confirm the exact address?`,
          sentAt: new Date().toISOString(),
        };
        const newMessages = { ...messages, [jobId]: [initMsg] };
        setMessages(newMessages);
        await persistMessages(newMessages);
      }
    },
    [user, jobs, messages],
  );

  const declineJob = useCallback(
    async (jobId: string) => {
      const job = jobs.find(j => j.id === jobId);
      if (job?.isDemo) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
      }
    },
    [jobs],
  );

  const completeJob = useCallback(
    async (jobId: string) => {
      const updatedJobs = jobs.map(j =>
        j.id === jobId ? { ...j, status: 'completed' as JobStatus, completedAt: new Date().toISOString() } : j,
      );
      setJobs(updatedJobs);
      await persistJobs(updatedJobs);
    },
    [jobs],
  );

  const cancelJob = useCallback(
    async (jobId: string) => {
      const updatedJobs = jobs.map(j => (j.id === jobId ? { ...j, status: 'cancelled' as JobStatus } : j));
      setJobs(updatedJobs);
      await persistJobs(updatedJobs);
    },
    [jobs],
  );

  const sendMessage = useCallback(
    async (jobId: string, text: string) => {
      if (!user) return;
      const newMsg: Message = {
        id: genId(),
        jobId,
        senderId: user.id,
        senderName: user.name,
        text,
        sentAt: new Date().toISOString(),
      };
      const jobMsgs = messages[jobId] ?? [];
      const newMessages = { ...messages, [jobId]: [...jobMsgs, newMsg] };
      setMessages(newMessages);
      await persistMessages(newMessages);
    },
    [user, messages],
  );

  const rateJob = useCallback(
    async (jobId: string, rating: number, comment: string) => {
      const updatedJobs = jobs.map(j => (j.id === jobId ? { ...j, rating, ratingComment: comment } : j));
      setJobs(updatedJobs);
      await persistJobs(updatedJobs);
    },
    [jobs],
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(KEYS.USER);
    setUserState(null);
  }, []);

  const getJobMessages = useCallback(
    (jobId: string): Message[] => messages[jobId] ?? [],
    [messages],
  );

  return (
    <AppContext.Provider
      value={{
        user,
        jobs,
        technicianProfiles,
        messages,
        isLoading,
        setUser,
        createJob,
        acceptJob,
        declineJob,
        completeJob,
        cancelJob,
        sendMessage,
        rateJob,
        signOut,
        getJobMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
