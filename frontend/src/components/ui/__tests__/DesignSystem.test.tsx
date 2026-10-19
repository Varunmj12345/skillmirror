import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Select,
  Alert,
  AlertTitle,
  AlertDescription,
  Modal,
  Tooltip,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../index';

describe('SkillMirror Unified Design System Primitives', () => {
  describe('Button', () => {
    it('renders with default variant and children', () => {
      render(<Button>Click Me</Button>);
      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass('font-mono');
    });

    it('renders primary variant with amber styling', () => {
      render(<Button variant="primary">Launch</Button>);
      const btn = screen.getByRole('button', { name: /launch/i });
      expect(btn).toHaveClass('from-amber-500');
    });

    it('handles disabled and loading states', () => {
      render(
        <Button loading disabled>
          Processing
        </Button>
      );
      const btn = screen.getByRole('button', { name: /processing/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Badge', () => {
    it('renders badge with text and dot indicator', () => {
      render(
        <Badge variant="amber" dot>
          Active
        </Badge>
      );
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders semantic success badge', () => {
      render(<Badge variant="success">Online</Badge>);
      const badge = screen.getByText('Online');
      expect(badge).toHaveClass('text-emerald-400');
    });
  });

  describe('Card', () => {
    it('renders full card hierarchy', () => {
      render(
        <Card>
          <CardHeader title="Telemetry Feed" subtitle="Live updates" />
          <CardContent>Card body content</CardContent>
          <CardFooter>Footer note</CardFooter>
        </Card>
      );
      expect(screen.getByText('Telemetry Feed')).toBeInTheDocument();
      expect(screen.getByText('Live updates')).toBeInTheDocument();
      expect(screen.getByText('Card body content')).toBeInTheDocument();
      expect(screen.getByText('Footer note')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders with label and helper text', () => {
      render(
        <Input label="Target Role" placeholder="Software Engineer" helperText="Enter job title" />
      );
      expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
      expect(screen.getByText('Enter job title')).toBeInTheDocument();
    });

    it('renders error message and applies error styles', () => {
      render(<Input label="Email" error="Invalid address format" />);
      expect(screen.getByText('Invalid address format')).toBeInTheDocument();
    });
  });

  describe('Select', () => {
    it('renders options and responds to change', () => {
      const options = [
        { value: 'all', label: 'All Levels' },
        { value: 'senior', label: 'Senior Staff' },
      ];
      render(<Select label="Experience" options={options} defaultValue="all" />);
      const select = screen.getByLabelText(/experience/i);
      expect(select).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Senior Staff' })).toBeInTheDocument();
    });
  });

  describe('Alert', () => {
    it('renders warning alert with title and description', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Critical Skill Gap</AlertTitle>
          <AlertDescription>Kubernetes proficiency is required.</AlertDescription>
        </Alert>
      );
      expect(screen.getByText('Critical Skill Gap')).toBeInTheDocument();
      expect(screen.getByText('Kubernetes proficiency is required.')).toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('renders when isOpen is true and triggers onClose', () => {
      const onClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Engine Settings">
          <div>Settings controls</div>
        </Modal>
      );
      expect(screen.getByText('Engine Settings')).toBeInTheDocument();
      expect(screen.getByText('Settings controls')).toBeInTheDocument();

      const closeBtn = screen.getByTitle('Close dialog');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()} title="Hidden">
          Content
        </Modal>
      );
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders trigger element and shows tooltip on hover', () => {
      render(
        <Tooltip content="Help tooltip content">
          <button>Hover trigger</button>
        </Tooltip>
      );
      const trigger = screen.getByRole('button', { name: /hover trigger/i });
      expect(trigger).toBeInTheDocument();

      fireEvent.mouseEnter(trigger.parentElement!);
      expect(screen.getByRole('tooltip')).toHaveTextContent('Help tooltip content');
    });
  });

  describe('Table', () => {
    it('renders table structure correctly', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>TypeScript</TableCell>
              <TableCell>94%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Skill')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('94%')).toBeInTheDocument();
    });
  });
});
