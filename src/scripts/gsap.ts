/** GSAP with its plugins, registered once. Import gsap from here, never from 'gsap' directly. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.config({ nullTargetWarn: false });
gsap.defaults({ ease: 'expo.out', duration: 0.9 });

export { gsap, ScrollTrigger, SplitText };
