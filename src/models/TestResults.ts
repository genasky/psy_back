import { Schema, model, Document } from 'mongoose'
import { IUser } from './User'

type TestType = 'SMI' | 'Beck' | 'Young'

export interface ITestResults extends Document {
  user: IUser
  type: TestType
  results: number[] | Record<number, number>[]
  createdAt: Date
}

const testResultsSchema = new Schema<ITestResults>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['SMI', 'Beck', 'Young'], required: true },
  results: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (this: any, value: any) {
        // Проверка по типу теста
        if (this.type === 'Beck') {
          return Array.isArray(value) && value.every(v => typeof v === 'object' && !Array.isArray(v))
        }
        if (this.type === 'SMI' || this.type === 'Young') {
          return Array.isArray(value) && value.every(v => typeof v === 'number')
        }
        return false
      },
      message: 'Неверный формат results для указанного типа теста'
    }
  },
  createdAt: { type: Date, default: Date.now }
})

export const TestResults = model<ITestResults>('TestResults', testResultsSchema)
