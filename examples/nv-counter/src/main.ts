import { mount } from '@neurova/runtime'
// @ts-expect-error — handled by @neurova/vite-plugin
import Counter from './Counter.nv'

const host = document.getElementById('app')!
mount(() => Counter({ start: 0 }), host)
