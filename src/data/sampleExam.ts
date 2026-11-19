import type { ExamData } from '../types/exam';

export const SAMPLE_EXAM: ExamData = {
  title: 'AWS Cloud Practitioner Quick Practice',
  description:
    'A concise practice exam covering core AWS cloud concepts, architecture principles, and security best practices. Includes both single-choice and multi-select questions.',
  questions: [
    {
      id: 1,
      question: 'Which AWS service is primarily used for durable, scalable object storage?',
      options: [
        { id: 'A', text: 'Amazon EC2' },
        { id: 'B', text: 'Amazon S3' },
        { id: 'C', text: 'Amazon RDS' },
        { id: 'D', text: 'AWS Lambda' },
      ],
      correctAnswers: ['B'],
      explanation:
        'Amazon S3 (Simple Storage Service) is an object storage service offering industry-leading scalability, data availability, security, and performance.',
    },
    {
      id: 2,
      question: 'Which of the following are key benefits of Cloud Computing? (Select TWO)',
      options: [
        { id: 'A', text: 'Trade capital expense for variable expense' },
        { id: 'B', text: 'Increase speed and agility' },
        { id: 'C', text: 'Requires managing physical data centers' },
        { id: 'D', text: 'Fixed hardware capacity with upfront commitments only' },
      ],
      correctAnswers: ['A', 'B'],
      explanation:
        'Cloud computing lets you pay only for what you consume (variable expense) and provision resources in minutes instead of weeks (speed and agility).',
    },
    {
      id: 3,
      question:
        'A developer wants to run event-driven backend code without provisioning or managing servers. Which AWS service fits best?',
      options: [
        { id: 'A', text: 'Amazon Lightsail' },
        { id: 'B', text: 'AWS Lambda' },
        { id: 'C', text: 'Amazon Elastic Block Store (EBS)' },
        { id: 'D', text: 'AWS Direct Connect' },
      ],
      correctAnswers: ['B'],
      explanation:
        'AWS Lambda is a serverless compute service that runs your code in response to events and automatically manages the underlying compute resources.',
    },
    {
      id: 4,
      question:
        'Under the AWS Shared Responsibility Model, which tasks are the **customer\'s** responsibility? (Select TWO)',
      options: [
        { id: 'A', text: 'Physical security of AWS data centers' },
        { id: 'B', text: 'Encrypting client-side application data' },
        { id: 'C', text: 'Managing IAM user permissions and MFA' },
        { id: 'D', text: 'Replacing failed physical disk drives on host servers' },
      ],
      correctAnswers: ['B', 'C'],
      explanation:
        'AWS is responsible for security "of" the cloud (physical hardware and data centers), while customers are responsible for security "in" the cloud (IAM policies, OS patching on EC2, and data encryption).',
    },
    {
      id: 5,
      question:
        'Which command uses the AWS CLI to list all buckets in your account?\n```bash\naws s3 <subcommand>\n```',
      options: [
        { id: 'A', text: '`aws s3 ls`' },
        { id: 'B', text: '`aws s3 list-all`' },
        { id: 'C', text: '`aws s3 show`' },
        { id: 'D', text: '`aws s3 buckets`' },
      ],
      correctAnswers: ['A'],
      explanation:
        'The `aws s3 ls` command lists all S3 buckets owned by the authenticated sender of the request, or objects inside a specific bucket when a path is provided.',
    },
    {
      id: 6,
      question:
        'Which of the following services help improve global latency and content delivery? (Select TWO)',
      options: [
        { id: 'A', text: 'Amazon CloudFront' },
        { id: 'B', text: 'AWS Global Accelerator' },
        { id: 'C', text: 'Amazon Glacier Deep Archive' },
        { id: 'D', text: 'AWS CloudTrail' },
      ],
      correctAnswers: ['A', 'B'],
      explanation:
        'Amazon CloudFront caches content at Edge Locations worldwide, and AWS Global Accelerator routes traffic over the AWS global network to optimize performance and availability.',
    },
  ],
};
