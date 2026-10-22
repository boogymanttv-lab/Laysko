const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const Shield = (p) => (<svg {...base} {...p}><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>);
export const Truck = (p) => (<svg {...base} {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>);
export const Pin = (p) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const Chat = (p) => (<svg {...base} {...p}><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>);
export const Arrow = (p) => (<svg {...base} width={18} height={18} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Check = (p) => (<svg {...base} width={18} height={18} {...p}><path d="M20 6L9 17l-5-5" /></svg>);
export const Bag = (p) => (<svg {...base} {...p}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 016 0" /></svg>);
