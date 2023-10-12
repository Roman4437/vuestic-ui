import { defineComponent, computed, ref } from 'vue'
import { useElementBackground } from './useElementBackground'
import { useCurrentElement } from './useCurrentElement'
import { VaButton } from '../components/va-button'
import UseElementBackgroundDummy from './UseElementBackgroundDummy.vue'
import { within } from '@storybook/testing-library'
import { sleep } from '../utils/sleep'
import { expect } from '@storybook/jest'

export default {
  title: 'composables/useElementBackground',
}

export const Default = () => ({
  components: { VaButton, UseElementBackgroundDummy },
  data () {
    return {
      background: '#000',
      color: null,
    }
  },
  template: `
  <UseElementBackgroundDummy
    :style="{ background }"
    @update:color="color = $event"
  />
  <p>Color detected: <span data-testid="color">{{color}}</span></p>
  <va-button @click="background = '#000'">black</va-button>
  <va-button @click="background = '#fff'">white</va-button>
`,
})

Default.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement)
  const color = canvas.getByTestId('color') as HTMLElement
  const black = canvas.getByText('black') as HTMLElement
  const white = canvas.getByText('white') as HTMLElement

  await sleep()

  await step('should match white', async () => {
    white.click()
    // Timing before update seems pretty random.
    // That might be something we want to account for on usage.
    // 20 ms was a sweet spot for me, 10 was too low.
    await sleep(20)
    expect(color.innerText).toBe('rgba255, 255, 255, 1')
  })
  await step('should match black', async () => {
    black.click()
    await sleep(20)
    expect(color.innerText).toBe('rgba0, 0, 0, 1')
  })
}

export const WithTransition = () => ({
  data () {
    return {
      styles: {
        background: '#000',
        color: '#fff',
      },
    }
  },

  setup () {
    return {
      color: useElementBackground(useCurrentElement()),
    }
  },

  template: `
<div :style="{ ...styles, transition: 'all 0.5s ease-in-out' }">
  <button @click="styles = { background: '#000', color: '#fff' }">Black</button>
  <button @click="styles = { background: '#fff', color: '#000' }">White</button>

  <div>Current color: {{ color }}</div>
</div>
`,
})

export const WithOpacity = () => ({
  data () {
    return {
      styles: {
        background: 'rgba(0, 0, 0, 0.5)',
        color: '#fff',
      },
    }
  },

  setup () {
    return {
      color: useElementBackground(useCurrentElement()),
    }
  },

  template: `
<div :style="{ ...styles }">
  <button @click="styles = { background: 'rgba(0, 0, 0, 0.5)', color: '#fff' }">Black</button>
  <button @click="styles = { background: 'rgba(255, 255, 255, 0.5)', color: '#000' }">White</button>

  <div>Current color: {{ color }}</div>
</div>
`,
})

export const WithOpacityAndParentWithDynamicBg = () => ({
  data () {
    return {
      styles: {
        background: 'red',
        color: '#fff',
      },
    }
  },

  components: {
    Child: defineComponent({
      setup () {
        return {
          color: useElementBackground(useCurrentElement()),
        }
      },
      template: '<div style="background: rgba(0, 0, 0, 0.5)" >Current color: {{ color }}</div>',
    }),
  },

  template: `
<div :style="{ ...styles, color: '#fff' }">
  <button @click="styles = { background: 'red', color: '#fff' }">Red</button>
  <button @click="styles = { background: 'blue', color: '#000' }">Blue</button>

  <Child />
</div>
`,
})

export const MultipleParentWithDynamicBg = () => ({
  data () {
    return {
      styles: {
        background: 'red',
        color: '#fff',
      },
    }
  },

  components: {
    Child: defineComponent({
      setup () {
        return {
          color: useElementBackground(useCurrentElement()),
        }
      },
      template: '<div style="background: rgba(0, 0, 0, 0.5)" >Current color: {{ color }}</div>',
    }),
  },

  template: `
  <div style="background: rgba(255, 255, 255, 0.5)">
    <div :style="{ ...styles, color: '#fff' }">
      <button @click="styles = { background: 'rgba(255, 0, 0, 0.3)' }">Red</button>
      <button @click="styles = { background: 'rgba(0, 0, 255, 0.3)' }">Blue</button>

      <Child />
      <div style="background: rgba(255, 255, 0, 0.5)">
        <Child />
      </div>
    </div>
  </div>
`,
})

export const WithOpacityAndWillChange = () => ({
  data () {
    return {
      styles: {
        background: 'red',
        color: '#fff',
      },
    }
  },

  components: {
    Child: defineComponent({
      setup () {
        return {
          color: useElementBackground(useCurrentElement()),
        }
      },
      template: '<div style="background: rgba(0, 0, 0, 0.5)">Current color: {{ color }}</div>',
    }),
  },

  template: `
<div :style="{ ...styles, willChange: 'background' }">
  <button @click="styles = { background: 'red', color: '#fff' }">Red</button>
  <button @click="styles = { background: 'rgba(0, 0, 255, 0.5)', color: '#fff' }">Transparent Blue</button>

  <Child />
</div>
`,
})
