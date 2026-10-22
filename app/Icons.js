const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const Shield = (p) => (<svg {...base} {...p}><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>);
export const Truck = (p) => (<svg {...base} {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>);
export const Pin = (p) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const Chat = (p) => (<svg {...base} {...p}><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>);
export const Arrow = (p) => (<svg {...base} width={18} height={18} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Check = (p) => (<svg {...base} width={18} height={18} {...p}><path d="M20 6L9 17l-5-5" /></svg>);
export const Bag = (p) => (<svg {...base} {...p}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 016 0" /></svg>);

export const Search = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
export const Undo = (p) => (<svg {...base} {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></svg>);
export const Card = (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>);
export const Menu = (p) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const Home = (p) => (<svg {...base} {...p}><path d="M4 11l8-7 8 7v9H4z" /><path d="M10 20v-6h4v6" /></svg>);
export const Store = (p) => (<svg {...base} {...p}><path d="M4 9l1-5h14l1 5" /><path d="M4 9v11h16V9" /><path d="M4 9a4 4 0 008 0 4 4 0 008 0" /></svg>);
