import React, { useState, useCallback, useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../utils/cn';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  component: React.ComponentType<WizardStepProps>;
  validation?: (data: any) => boolean | Promise<boolean>;
  optional?: boolean;
  hidden?: (data: any) => boolean;
}

export interface WizardStepProps {
  data: any;
  updateData: (data: any) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (stepId: string) => void;
  isFirst: boolean;
  isLast: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface FormWizardProps<T extends FieldValues = FieldValues> {
  /**
   * Wizard steps configuration
   */
  steps: WizardStep[];
  /**
   * Initial data
   */
  initialData?: Partial<T>;
  /**
   * Callback when wizard is completed
   */
  onComplete: (data: T) => void | Promise<void>;
  /**
   * Callback when data changes
   */
  onChange?: (data: Partial<T>) => void;
  /**
   * Callback when step changes
   */
  onStepChange?: (stepId: string, stepIndex: number) => void;
  /**
   * Whether to show progress indicator
   */
  showProgress?: boolean;
  /**
   * Progress indicator type
   */
  progressType?: 'steps' | 'bar' | 'dots';
  /**
   * Whether steps can be clicked to navigate
   */
  allowStepNavigation?: boolean;
  /**
   * Whether to persist data in localStorage
   */
  persistData?: boolean;
  /**
   * LocalStorage key for data persistence
   */
  storageKey?: string;
  /**
   * Whether to validate steps before proceeding
   */
  validateOnNext?: boolean;
  /**
   * Custom navigation buttons
   */
  renderNavigation?: (props: NavigationProps) => React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the wizard is loading
   */
  loading?: boolean;
}

export interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  onComplete: () => void;
  loading?: boolean;
}

export function FormWizard<T extends FieldValues = FieldValues>({
  steps,
  initialData = {},
  onComplete,
  onChange,
  onStepChange,
  showProgress = true,
  progressType = 'steps',
  allowStepNavigation = false,
  persistData = false,
  storageKey = 'form-wizard-data',
  validateOnNext = true,
  renderNavigation,
  className,
  loading = false,
}: FormWizardProps<T>) {
  // Filter out hidden steps
  const visibleSteps = steps.filter(step => !step.hidden?.(initialData));
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<Partial<T>>(() => {
    if (persistData) {
      try {
        const saved = localStorage.getItem(storageKey);
        return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
      } catch {
        return initialData;
      }
    }
    return initialData;
  });
  const [stepValidation, setStepValidation] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const currentStep = visibleSteps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === visibleSteps.length - 1;

  // Persist data to localStorage
  useEffect(() => {
    if (persistData) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to persist wizard data:', error);
      }
    }
  }, [data, persistData, storageKey]);

  // Notify data changes
  useEffect(() => {
    onChange?.(data);
  }, [data, onChange]);

  // Notify step changes
  useEffect(() => {
    onStepChange?.(currentStep.id, currentStepIndex);
  }, [currentStep.id, currentStepIndex, onStepChange]);

  const updateData = useCallback((newData: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const validateStep = useCallback(async (step: WizardStep): Promise<boolean> => {
    if (!step.validation) return true;
    
    setIsValidating(true);
    try {
      const isValid = await step.validation(data);
      setStepValidation(prev => ({ ...prev, [step.id]: isValid }));
      return isValid;
    } catch (error) {
      console.error('Step validation error:', error);
      setStepValidation(prev => ({ ...prev, [step.id]: false }));
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [data]);

  const goToStep = useCallback(async (stepId: string) => {
    const stepIndex = visibleSteps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    // If moving forward, validate intermediate steps
    if (stepIndex > currentStepIndex && validateOnNext) {
      for (let i = currentStepIndex; i < stepIndex; i++) {
        const step = visibleSteps[i];
        if (!step.optional) {
          const isValid = await validateStep(step);
          if (!isValid) {
            return; // Stop if validation fails
          }
        }
      }
    }

    setCurrentStepIndex(stepIndex);
  }, [currentStepIndex, visibleSteps, validateOnNext, validateStep]);

  const goToNext = useCallback(async () => {
    if (isLast) return;

    if (validateOnNext && !currentStep.optional) {
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }

    setCurrentStepIndex(prev => Math.min(prev + 1, visibleSteps.length - 1));
  }, [isLast, validateOnNext, currentStep, validateStep, visibleSteps.length]);

  const goToPrevious = useCallback(() => {
    if (isFirst) return;
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  }, [isFirst]);

  const handleComplete = useCallback(async () => {
    // Validate all required steps
    if (validateOnNext) {
      for (const step of visibleSteps) {
        if (!step.optional) {
          const isValid = await validateStep(step);
          if (!isValid) {
            // Go to first invalid step
            const stepIndex = visibleSteps.findIndex(s => s.id === step.id);
            setCurrentStepIndex(stepIndex);
            return;
          }
        }
      }
    }

    try {
      await onComplete(data as T);
      
      // Clear persisted data on successful completion
      if (persistData) {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Wizard completion error:', error);
    }
  }, [visibleSteps, validateOnNext, validateStep, onComplete, data, persistData, storageKey]);

  const canGoNext = !isLast && !isValidating;
  const canGoPrevious = !isFirst && !isValidating;
  const canComplete = isLast && !isValidating;

  const renderProgressIndicator = () => {
    if (!showProgress) return null;

    const completedSteps = currentStepIndex;
    const progressPercentage = (completedSteps / (visibleSteps.length - 1)) * 100;

    switch (progressType) {
      case 'bar':
        return (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="mb-8 flex justify-center space-x-2">
            {visibleSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => allowStepNavigation && goToStep(visibleSteps[index].id)}
                className={cn(
                  'h-3 w-3 rounded-full transition-all duration-200',
                  index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-300',
                  allowStepNavigation && 'hover:scale-110 cursor-pointer'
                )}
                disabled={!allowStepNavigation}
                aria-label={`Go to step ${index + 1}: ${visibleSteps[index].title}`}
              />
            ))}
          </div>
        );

      case 'steps':
      default:
        return (
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {visibleSteps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isClickable = allowStepNavigation && (isCompleted || isCurrent);

                  return (
                    <li key={step.id} className={cn('relative', index !== visibleSteps.length - 1 && 'pr-8 sm:pr-20')}>
                      {index !== visibleSteps.length - 1 && (
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className={cn('h-0.5 w-full', isCompleted ? 'bg-blue-600' : 'bg-gray-200')} />
                        </div>
                      )}
                      
                      <button
                        onClick={() => isClickable && goToStep(step.id)}
                        disabled={!isClickable}
                        className={cn(
                          'relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                          isCompleted && 'border-blue-600 bg-blue-600 text-white',
                          isCurrent && 'border-blue-600 bg-white text-blue-600',
                          !isCompleted && !isCurrent && 'border-gray-300 bg-white text-gray-500',
                          isClickable && 'hover:scale-110 cursor-pointer'
                        )}
                        aria-current={isCurrent ? 'step' : undefined}
                        aria-label={`Step ${index + 1}: ${step.title}`}
                      >
                        {isCompleted ? (
                          <Icon name="check" size="sm" />
                        ) : step.icon ? (
                          step.icon
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </button>
                      
                      <div className="mt-2">
                        <p className={cn('text-sm font-medium', isCurrent ? 'text-blue-600' : 'text-gray-500')}>
                          {step.title}
                        </p>
                        {step.description && (
                          <p className="text-xs text-gray-500">{step.description}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        );
    }
  };

  const renderDefaultNavigation = () => (
    <div className="flex justify-between pt-6 border-t border-gray-200">
      <Button
        type="button"
        variant="outline"
        onClick={goToPrevious}
        disabled={!canGoPrevious || loading}
        leftIcon={<Icon name="chevron-left" size="sm" />}
      >
        Previous
      </Button>
      
      <div className="flex space-x-3">
        {!isLast ? (
          <Button
            type="button"
            onClick={goToNext}
            disabled={!canGoNext || loading}
            loading={isValidating}
            rightIcon={<Icon name="chevron-right" size="sm" />}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleComplete}
            disabled={!canComplete || loading}
            loading={loading}
            variant="success"
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );

  const stepProps: WizardStepProps = {
    data,
    updateData,
    goToNext,
    goToPrevious,
    goToStep,
    isFirst,
    isLast,
    currentStep: currentStepIndex + 1,
    totalSteps: visibleSteps.length,
  };

  const navigationProps: NavigationProps = {
    currentStep: currentStepIndex + 1,
    totalSteps: visibleSteps.length,
    isFirst,
    isLast,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    onComplete: handleComplete,
    loading,
  };

  if (!currentStep) {
    return <div>No steps available</div>;
  }

  const StepComponent = currentStep.component;

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {renderProgressIndicator()}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
          {currentStep.description && (
            <p className="mt-2 text-gray-600">{currentStep.description}</p>
          )}
        </div>
        
        <div className="min-h-[400px]">
          <StepComponent {...stepProps} />
        </div>
        
        {renderNavigation ? renderNavigation(navigationProps) : renderDefaultNavigation()}
      </div>
    </div>
  );
}