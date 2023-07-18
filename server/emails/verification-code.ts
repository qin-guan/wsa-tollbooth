import { defineComponent } from 'vue'
import {
  VEBody, VEColumn, VEContainer, VEHead, VEHeading, VEHtml, VEImg, VELink, VEPreview, VERow, VESection, VEText,
} from '@qingu/vue-email'

export const VerificationCodeEmail = defineComponent({
  components: {
    VEBody, VEColumn, VEContainer, VEHead, VEHeading, VEHtml, VEImg, VELink, VEPreview, VERow, VESection, VEText,
  },
  props: {
    verificationCode: String,
    appName: String,
  },
  template: `
    <VEHtml>
      <VEHead />
      <VEPreview :content="$props.verificationCode + ' is your verification code'" />
      <VEBody style="background-color: #fff; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif">
        <VEContainer style="max-width: 600px; margin: 0 auto;">
          <VESection style="margin-top: 32px">
            <VEText style="height: 36px">{{ $props.appName }}</VEText>
          </VESection>
          <VEHeading style="color: #1d1c1d; font-size: 36px; font-weight: 700; margin: 30px 0; padding: 0; line-height: 42px;">
            {{ $props.verificationCode }} is your verification code
          </VEHeading>
          <VEText style="font-size: 20px; line-height: 28px; margin-bottom: 30px;">
            Your verification code is below - enter it in your open browser window
            and we'll help you get signed in.
          </VEText>

          <VESection style="background: rgb(245, 244, 245); border-radius: 4px; margin-right: 50px; margin-bottom: 30px; padding: 43px 23px;">
            <VEText style="font-size: 30px; text-align: center; vertical-align: middle;">
              {{ $props.verificationCode }}
            </VEText>
          </VESection>

          <VEText style="color: #000; font-size: 14px; line-height: 24px;">
            If you didn't request this email, there's nothing to worry about - you
            can safely ignore it.
          </VEText>

          <VESection>
            <VEText style="font-size: 12px; color: #b7b7b7; line-height: 15px; text-align: left; margin-bottom: 50px;">
              © {{ $props.appName }}. <br>
              All rights reserved.
            </VEText>
          </VESection>
        </VEContainer>
      </VEBody>
    </VEHtml>
  `,
})
